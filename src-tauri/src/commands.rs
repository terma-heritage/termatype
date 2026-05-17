use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use crate::docx;

#[derive(Debug, Serialize, Deserialize)]
pub struct DocumentContent {
    pub content: serde_json::Value,
    pub path: Option<String>,
}

#[tauri::command]
pub fn new_document() -> Result<serde_json::Value, String> {
    let empty_doc = serde_json::json!({
        "type": "doc",
        "content": [
            {
                "type": "paragraph",
                "content": []
            }
        ]
    });
    Ok(empty_doc)
}

#[tauri::command]
pub fn read_file(path: String) -> Result<DocumentContent, String> {
    let path_buf = PathBuf::from(&path);
    let ext = path_buf
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match ext.as_str() {
        "docx" => {
            let content = docx::read_docx(&path)?;
            Ok(DocumentContent {
                content,
                path: Some(path),
            })
        }
        "txt" | "md" | "html" => {
            let text = fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read file: {}", e))?;

            let paragraphs: Vec<serde_json::Value> = text
                .lines()
                .map(|line| {
                    if line.is_empty() {
                        serde_json::json!({
                            "type": "paragraph",
                            "content": []
                        })
                    } else {
                        serde_json::json!({
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": line
                                }
                            ]
                        })
                    }
                })
                .collect();

            let content = serde_json::json!({
                "type": "doc",
                "content": if paragraphs.is_empty() {
                    vec![serde_json::json!({"type": "paragraph", "content": []})]
                } else {
                    paragraphs
                }
            });

            Ok(DocumentContent {
                content,
                path: Some(path),
            })
        }
        _ => Err(format!("Unsupported file format: .{}", ext)),
    }
}

#[tauri::command]
pub fn write_file(path: String, content: serde_json::Value) -> Result<(), String> {
    let path_buf = PathBuf::from(&path);
    let ext = path_buf
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match ext.as_str() {
        "docx" => docx::write_docx(&path, &content),
        "txt" => {
            let text = extract_plain_text(&content);
            fs::write(&path, text).map_err(|e| format!("Failed to write file: {}", e))
        }
        "md" => {
            let text = extract_plain_text(&content);
            fs::write(&path, text).map_err(|e| format!("Failed to write file: {}", e))
        }
        "html" => {
            let text = extract_plain_text(&content);
            fs::write(&path, text).map_err(|e| format!("Failed to write file: {}", e))
        }
        _ => Err(format!("Unsupported file format: .{}", ext)),
    }
}

#[cfg(debug_assertions)]
#[tauri::command]
pub fn debug_docx(path: String) -> Result<String, String> {
    let mut file = fs::File::open(&path).map_err(|e| format!("Failed to open: {}", e))?;
    let mut buf = Vec::new();
    use std::io::Read;
    file.read_to_end(&mut buf)
        .map_err(|e| format!("Failed to read: {}", e))?;

    let docx =
        docx_rs::read_docx(&buf).map_err(|e| format!("Failed to parse DOCX: {}", e))?;
    let json_str = docx.json();
    Ok(json_str)
}

fn extract_plain_text(content: &serde_json::Value) -> String {
    let mut result = String::new();
    extract_text_recursive(content, &mut result);
    result
}

fn extract_text_recursive(node: &serde_json::Value, result: &mut String) {
    if let Some(text) = node.get("text").and_then(|t| t.as_str()) {
        result.push_str(text);
    }

    if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
        if node_type == "paragraph" && !result.is_empty() && !result.ends_with('\n') {
            result.push('\n');
        }
        if node_type == "heading" && !result.is_empty() && !result.ends_with('\n') {
            result.push('\n');
        }
    }

    if let Some(children) = node.get("content").and_then(|c| c.as_array()) {
        for child in children {
            extract_text_recursive(child, result);
        }
        if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
            if matches!(node_type, "paragraph" | "heading") {
                result.push('\n');
            }
        }
    }
}
