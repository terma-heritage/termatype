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
pub struct TranslatorState {
    pub loaded: bool,
    pub loading: bool,
}

pub struct TranslatorModel {
    pub(crate) model: Option<Arc<LlamaModel>>,
    loading: bool,
}

impl TranslatorModel {
    pub fn new() -> Self {
        Self {
            model: None,
            loading: false,
        }
    }
}

pub type SharedTranslator = Arc<Mutex<TranslatorModel>>;

pub fn create_shared_translator() -> SharedTranslator {
    Arc::new(Mutex::new(TranslatorModel::new()))
}

fn get_model_path(app: &AppHandle) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    Ok(data_dir
        .join("plugin-data")
        .join("terma-translator")
        .join("gemma-2-mitra-it.i1-Q4_K_M.gguf"))
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

fn generate_translation(
    model: &LlamaModel,
    backend: &LlamaBackend,
    prompt: &str,
    max_tokens: u32,
) -> Result<String, String> {
    let n_threads = std::thread::available_parallelism()
        .map(|n| n.get() as i32)
        .unwrap_or(4);

    // Disable Flash Attention — Gemma 2's logit softcapping is incompatible with FA
    let ctx_params = LlamaContextParams::default()
        .with_n_ctx(NonZeroU32::new(2048))
        .with_n_threads(n_threads)
        .with_n_threads_batch(n_threads)
        .with_flash_attention_policy(0);

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
        batch
            .add(*token, i as i32, &[0], is_last)
            .map_err(|e| format!("Batch add failed: {:?}", e))?;
    }

    ctx.decode(&mut batch)
        .map_err(|e| format!("Decode failed: {:?}", e))?;

    let mut sampler = LlamaSampler::chain_simple([
        LlamaSampler::penalties(256, 1.15, 0.0, 0.0),
        LlamaSampler::temp(0.1),
        LlamaSampler::top_p(0.95, 1),
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

        // '#' is MITRA's stop token
        if text.contains('#') {
            // Add any text before the '#'
            if let Some(pos) = text.find('#') {
                output.push_str(&text[..pos]);
            }
            break;
        }

        output.push_str(&text);

        batch.clear();
        batch
            .add(token, n_cur, &[0], true)
            .map_err(|e| format!("Batch add failed: {:?}", e))?;
        n_cur += 1;

        ctx.decode(&mut batch)
            .map_err(|e| format!("Decode failed: {:?}", e))?;
    }

    // Cut at first '#' (MITRA stop token) — safety net for any that slipped through
    let output = if let Some(pos) = output.find('#') {
        output[..pos].to_string()
    } else {
        output
    };

    let cleaned = output
        .replace("<start_of_turn>", "")
        .replace("<end_of_turn>", "")
        .replace("<bos>", "")
        .replace("<eos>", "")
        .replace("🔽", "\n")
        .trim()
        .to_string();

    // Strip "Translation:" prefix the model sometimes adds
    let cleaned = cleaned
        .strip_prefix("Translation:")
        .or_else(|| cleaned.strip_prefix("translation:"))
        .unwrap_or(&cleaned)
        .trim()
        .to_string();

    // Remove trailing pipe/slash/garbage
    let cleaned = cleaned
        .trim_end_matches(|c: char| c == '|' || c == '/' || c == '\\' || c == '\n')
        .trim()
        .to_string();

    Ok(cleaned)
}

fn build_translation_prompt(text: &str, direction: &str) -> String {
    let target_language = match direction {
        "bo_to_en" => "English",
        "en_to_bo" => "Tibetan",
        _ => "English",
    };

    // MITRA prompt format: replace newlines with 🔽, end with "Translation::"
    // The model outputs '#' as a stop token
    let cleaned_text = text.replace('\n', " 🔽 ");
    format!(
        "Please translate into {}: {} Translation::",
        target_language, cleaned_text
    )
}

#[tauri::command]
pub async fn load_translator(app: AppHandle) -> Result<(), String> {
    let model_path = get_model_path(&app)?;
    if !model_path.exists() {
        return Err(
            "Model not installed. Go to View → Extensions to install Terma Translator.".to_string(),
        );
    }

    // Unload assistant to free memory (only one model at a time)
    let assistant = app
        .state::<crate::assistant::SharedAssistant>()
        .inner()
        .clone();
    {
        let mut guard = assistant.lock().await;
        guard.model = None;
    }

    let translator = app.state::<SharedTranslator>().inner().clone();
    let mut guard = translator.lock().await;

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
pub async fn unload_translator(app: AppHandle) -> Result<(), String> {
    let translator = app.state::<SharedTranslator>().inner().clone();
    let mut guard = translator.lock().await;
    guard.model = None;
    Ok(())
}

#[tauri::command]
pub async fn get_translator_state(app: AppHandle) -> Result<TranslatorState, String> {
    let translator = app.state::<SharedTranslator>().inner().clone();
    let guard = translator.lock().await;
    Ok(TranslatorState {
        loaded: guard.model.is_some(),
        loading: guard.loading,
    })
}

#[tauri::command]
pub async fn translate_text(
    app: AppHandle,
    text: String,
    direction: String,
) -> Result<String, String> {
    if text.trim().is_empty() {
        return Err("No text to translate".to_string());
    }

    let translator = app.state::<SharedTranslator>().inner().clone();

    let model = {
        let guard = translator.lock().await;
        guard.model.as_ref().ok_or("Model not loaded")?.clone()
    };
    let backend = {
        let shared_backend = app.state::<SharedBackend>().inner().clone();
        let mut bg = shared_backend.lock().await;
        bg.ensure()?
    };

    tokio::task::spawn_blocking(move || {
        let trimmed = truncate_input(&text);
        let prompt = build_translation_prompt(trimmed, &direction);
        generate_translation(&model, &backend, &prompt, 512)
    })
    .await
    .map_err(|e| format!("Task failed: {}", e))?
}

#[derive(Debug, Clone, Serialize)]
pub struct SystemInfo {
    pub total_ram_gb: f64,
    pub available_ram_gb: f64,
    pub can_run_translator: bool,
    pub reason: Option<String>,
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    use sysinfo::System;

    let mut sys = System::new();
    sys.refresh_memory();

    let total_ram_gb = sys.total_memory() as f64 / 1_073_741_824.0;
    let available_ram_gb = sys.available_memory() as f64 / 1_073_741_824.0;

    let can_run = total_ram_gb >= 12.0;
    let reason = if !can_run {
        Some(format!(
            "Your system has {:.1} GB RAM. The translator requires at least 12 GB.",
            total_ram_gb
        ))
    } else {
        None
    };

    Ok(SystemInfo {
        total_ram_gb,
        available_ram_gb,
        can_run_translator: can_run,
        reason,
    })
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    // Only allow http:// and https:// URLs to prevent command injection
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err("Only http:// and https:// URLs are allowed".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &url])
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    Ok(())
}
