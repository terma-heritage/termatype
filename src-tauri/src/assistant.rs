use llama_cpp_2::context::params::LlamaContextParams;
use llama_cpp_2::llama_backend::LlamaBackend;
use llama_cpp_2::llama_batch::LlamaBatch;
use llama_cpp_2::model::params::LlamaModelParams;
use llama_cpp_2::model::LlamaModel;
use llama_cpp_2::sampling::LlamaSampler;
use serde::{Deserialize, Serialize};
use std::num::NonZeroU32;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tokio::sync::Mutex;

use crate::backend::SharedBackend;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssistantState {
    pub loaded: bool,
    pub loading: bool,
}

pub struct AssistantModel {
    pub(crate) model: Option<Arc<LlamaModel>>,
    loading: bool,
}

impl AssistantModel {
    pub fn new() -> Self {
        Self {
            model: None,
            loading: false,
        }
    }
}

pub type SharedAssistant = Arc<Mutex<AssistantModel>>;

pub fn create_shared_assistant() -> SharedAssistant {
    Arc::new(Mutex::new(AssistantModel::new()))
}

fn get_model_path(app: &AppHandle) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    Ok(data_dir
        .join("plugin-data")
        .join("terma-assistant")
        .join("gemma-3-1b-it-Q4_K_M.gguf"))
}

const MAX_INPUT_CHARS: usize = 2000;

fn truncate_input(text: &str) -> &str {
    if text.len() <= MAX_INPUT_CHARS {
        return text;
    }
    let boundary = text
        .char_indices()
        .take_while(|(i, _)| *i <= MAX_INPUT_CHARS)
        .last()
        .map(|(i, c)| i + c.len_utf8())
        .unwrap_or(text.len());
    let slice = &text[..boundary];
    match slice.rfind(|c: char| c.is_whitespace()) {
        Some(pos) => &text[..pos],
        None => slice,
    }
}

fn generate_response(model: &LlamaModel, backend: &LlamaBackend, prompt: &str, max_tokens: u32) -> Result<String, String> {
    let n_threads = std::thread::available_parallelism()
        .map(|n| n.get() as i32)
        .unwrap_or(4);

    let ctx_params = LlamaContextParams::default()
        .with_n_ctx(NonZeroU32::new(2048))
        .with_n_threads(n_threads)
        .with_n_threads_batch(n_threads);

    let mut ctx = model
        .new_context(backend, ctx_params)
        .map_err(|e| format!("Failed to create context: {:?}", e))?;

    let tokens = model
        .str_to_token(prompt, llama_cpp_2::model::AddBos::Always)
        .map_err(|e| format!("Tokenization failed: {:?}", e))?;

    if tokens.len() > 1800 {
        return Err("Text too long. Please select a smaller portion.".to_string());
    }

    let mut batch = LlamaBatch::new(2048, 1);

    for (i, token) in tokens.iter().enumerate() {
        let is_last = i == tokens.len() - 1;
        batch.add(*token, i as i32, &[0], is_last)
            .map_err(|e| format!("Batch add failed: {:?}", e))?;
    }

    ctx.decode(&mut batch)
        .map_err(|e| format!("Decode failed: {:?}", e))?;

    let mut sampler = LlamaSampler::chain_simple([
        LlamaSampler::temp(0.3),
        LlamaSampler::top_p(0.9, 1),
        LlamaSampler::dist(1234),
    ]);

    let mut output = String::new();
    let mut n_cur = tokens.len() as i32;

    for _ in 0..max_tokens {
        let token = sampler.sample(&ctx, batch.n_tokens() - 1);
        sampler.accept(token);

        if model.is_eog_token(token) {
            break;
        }

        let bytes = model
            .token_to_piece_bytes(token, 32, false, None)
            .map_err(|e| format!("Token to str failed: {:?}", e))?;
        let text = String::from_utf8_lossy(&bytes);

        if text.contains("<start_of_turn>") || text.contains("<end_of_turn>") {
            break;
        }

        output.push_str(&text);

        batch.clear();
        batch.add(token, n_cur, &[0], true)
            .map_err(|e| format!("Batch add failed: {:?}", e))?;
        n_cur += 1;

        ctx.decode(&mut batch)
            .map_err(|e| format!("Decode failed: {:?}", e))?;
    }

    let cleaned = output
        .replace("<start_of_turn>", "")
        .replace("<end_of_turn>", "")
        .replace("<bos>", "")
        .replace("<eos>", "")
        .trim()
        .to_string();

    Ok(cleaned)
}

fn build_transform_prompt(text: &str, mode: &str) -> String {
    let anti_ai = "Use simple everyday words, be direct. NEVER use: moreover, furthermore, additionally, hence, thus, utilize, delve, leverage, facilitate, remarkably, incredibly, significantly.";

    let instruction = match mode {
        "fix" => format!("Fix ONLY grammar, spelling, and punctuation errors in this text. Do NOT change any words or rephrase. If the text says \"I\" keep \"I\". If the text says \"he\" or \"she\" keep \"he\" or \"she\". Output ONLY the corrected text. No explanations. {}", anti_ai),
        "rewrite" => format!("Rewrite this text in clearer English. Keep the EXACT same meaning. IMPORTANT: If the original text uses \"I\" or \"my\", your output MUST also use \"I\" and \"my\". If the original uses \"he\"/\"she\"/\"they\", keep that. Never change who is speaking. Output ONLY the rewritten text. No explanations, no preamble. {}", anti_ai),
        "enhance" => format!("Improve this text: fix errors, make it clearer, and add small details where it feels thin. IMPORTANT: If the original text uses \"I\" or \"my\", your output MUST also use \"I\" and \"my\". Never switch from first person to third person. Only add details that follow from what was written. Output ONLY the enhanced text. No explanations. {}", anti_ai),
        _ => format!("Fix grammar, spelling, and punctuation. Keep the same meaning. If the text uses \"I\", keep \"I\". Output ONLY the corrected text. {}", anti_ai),
    };

    format!(
        r#"<start_of_turn>user
{}

Text:
"""
{}
"""
<end_of_turn>
<start_of_turn>model
"#,
        instruction, text
    )
}

fn clean_transform_response(response: &str) -> String {
    let mut text = response.trim();

    let preambles = [
        "Here's an improved version of the text:",
        "Here's the improved version:",
        "Here's an improved version:",
        "Here's the improved text:",
        "Here's the simplified version:",
        "Here's the simplified text:",
        "Here's the shortened version:",
        "Here's the shortened text:",
        "Here's the expanded version:",
        "Here's the expanded text:",
        "Here's the formal version:",
        "Here's the formalized version:",
        "Here is the improved version:",
        "Here is the improved text:",
        "Here's the corrected text:",
        "Here is the corrected text:",
        "Here's the rewritten text:",
        "Here is the rewritten text:",
        "Here's the rewritten version:",
        "Here is the rewritten version:",
        "Here's the enhanced text:",
        "Here is the enhanced text:",
        "Here's the enhanced version:",
        "Here is the enhanced version:",
        "Here's the fixed text:",
        "Here is the fixed text:",
    ];
    for preamble in &preambles {
        if let Some(rest) = text.strip_prefix(preamble) {
            text = rest.trim();
            break;
        }
    }
    if text.starts_with("Here's ") || text.starts_with("Here is ") {
        if let Some(colon_pos) = text.find(':') {
            if colon_pos < 80 {
                text = text[colon_pos + 1..].trim();
            }
        }
    }

    let quote_chars: &[char] = &['"', '\u{201c}', '\u{201d}', '\u{2018}', '\u{2019}', '\''];
    let mut result = text.to_string();
    while result.starts_with(quote_chars) || result.starts_with('"') {
        result = result.trim_start_matches(quote_chars).trim_start_matches('"').to_string();
    }
    while result.ends_with(quote_chars) || result.ends_with('"') {
        result = result.trim_end_matches(quote_chars).trim_end_matches('"').to_string();
    }

    result.trim().to_string()
}

#[tauri::command]
pub async fn load_assistant(app: AppHandle) -> Result<(), String> {
    let model_path = get_model_path(&app)?;
    if !model_path.exists() {
        return Err("Model not installed. Go to View → Extensions to install Terma Assistant.".to_string());
    }

    // Unload translator to free memory (only one model at a time)
    let translator = app.state::<crate::translator::SharedTranslator>().inner().clone();
    {
        let mut guard = translator.lock().await;
        guard.model = None;
    }

    let assistant = app.state::<SharedAssistant>().inner().clone();
    let mut guard = assistant.lock().await;

    if guard.model.is_some() {
        return Ok(());
    }

    guard.loading = true;

    let shared_backend = app.state::<SharedBackend>().inner().clone();
    let backend = {
        let mut bg = shared_backend.lock().await;
        bg.ensure()?
    };
    let path = model_path.clone();
    let model_params = LlamaModelParams::default();

    let result = LlamaModel::load_from_file(&backend, path, &model_params);

    match result {
        Ok(model) => {
            guard.model = Some(Arc::new(model));
            guard.loading = false;
            Ok(())
        }
        Err(e) => {
            guard.loading = false;
            Err(format!("Failed to load model: {:?}", e))
        }
    }
}

#[tauri::command]
pub async fn unload_assistant(app: AppHandle) -> Result<(), String> {
    let assistant = app.state::<SharedAssistant>().inner().clone();
    let mut guard = assistant.lock().await;
    guard.model = None;
    Ok(())
}

#[tauri::command]
pub async fn get_assistant_state(app: AppHandle) -> Result<AssistantState, String> {
    let assistant = app.state::<SharedAssistant>().inner().clone();
    let guard = assistant.lock().await;
    Ok(AssistantState {
        loaded: guard.model.is_some(),
        loading: guard.loading,
    })
}

#[tauri::command]
pub async fn transform_text(app: AppHandle, text: String, mode: String) -> Result<String, String> {
    if text.trim().is_empty() {
        return Err("No text selected".to_string());
    }

    let assistant = app.state::<SharedAssistant>().inner().clone();

    let max_tokens = match mode.as_str() {
        "enhance" => 512,
        _ => 256,
    };

    let model = {
        let guard = assistant.lock().await;
        guard.model.as_ref().ok_or("Model not loaded")?.clone()
    };
    let backend = {
        let shared_backend = app.state::<SharedBackend>().inner().clone();
        let mut bg = shared_backend.lock().await;
        bg.ensure()?
    };

    tokio::task::spawn_blocking(move || {
        let trimmed = truncate_input(&text);
        let prompt = build_transform_prompt(trimmed, &mode);
        let response = generate_response(&model, &backend, &prompt, max_tokens)?;
        Ok(clean_transform_response(&response))
    })
    .await
    .map_err(|e| format!("Task failed: {}", e))?
}
