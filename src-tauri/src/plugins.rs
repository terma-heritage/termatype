use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub download_url: String,
    pub file_name: String,
    pub size_mb: f64,
    pub installed: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct DictResult {
    pub headword: String,
    pub headword_wylie: Option<String>,
    pub definition: String,
    pub source: String,
    pub source_name: String,
}

pub struct DictionaryDb {
    conn: Option<Connection>,
}

impl DictionaryDb {
    pub fn new() -> Mutex<Self> {
        Mutex::new(Self { conn: None })
    }
}

fn get_plugins_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let plugins_dir = data_dir.join("plugin-data");
    fs::create_dir_all(&plugins_dir)
        .map_err(|e| format!("Failed to create plugins dir: {}", e))?;
    Ok(plugins_dir)
}

const VALID_PLUGIN_IDS: &[&str] = &["terma-dictionary", "terma-assistant", "terma-translator"];

fn get_plugin_data_path(app: &AppHandle, plugin_id: &str) -> Result<PathBuf, String> {
    if !VALID_PLUGIN_IDS.contains(&plugin_id) {
        return Err(format!("Unknown plugin: {}", plugin_id));
    }
    let plugins_dir = get_plugins_dir(app)?;
    let plugin_dir = plugins_dir.join(plugin_id);
    fs::create_dir_all(&plugin_dir)
        .map_err(|e| format!("Failed to create plugin dir: {}", e))?;
    Ok(plugin_dir)
}

fn get_dictionary_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let plugin_dir = get_plugin_data_path(app, "terma-dictionary")?;
    Ok(plugin_dir.join("terma-dictionary.db"))
}

fn get_plugin_manifest() -> Vec<PluginInfo> {
    vec![
        PluginInfo {
            id: "terma-dictionary".to_string(),
            name: "Terma Dictionary".to_string(),
            description: "Tibetan-English dictionary with 239,000+ entries from Rangjung Yeshe and Monlam. Select a word or search to find meanings.".to_string(),
            version: "2.0.0".to_string(),
            download_url: "https://github.com/vajradog/termatype-app/releases/download/v1.0.0/terma-dictionary.db".to_string(),
            file_name: "terma-dictionary.db".to_string(),
            size_mb: 48.0,
            installed: false,
        },
        PluginInfo {
            id: "terma-assistant".to_string(),
            name: "Terma Assistant".to_string(),
            description: "AI writing assistant powered by Gemma 3. Grammar, spelling, tone detection, and paragraph rewrites — all offline.".to_string(),
            version: "1.1.0".to_string(),
            download_url: "https://huggingface.co/unsloth/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf".to_string(),
            file_name: "gemma-3-1b-it-Q4_K_M.gguf".to_string(),
            size_mb: 806.0,
            installed: false,
        },
        PluginInfo {
            id: "terma-translator".to_string(),
            name: "Terma Translator".to_string(),
            description: "Tibetan-English translation powered by MITRA (Sebastian Nehrdich & Kurt Keutzer, Berkeley AI Research). Translate selected text between Tibetan and English — all offline.".to_string(),
            version: "1.0.0".to_string(),
            download_url: "https://huggingface.co/mradermacher/gemma-2-mitra-it-i1-GGUF/resolve/main/gemma-2-mitra-it.i1-Q4_K_M.gguf".to_string(),
            file_name: "gemma-2-mitra-it.i1-Q4_K_M.gguf".to_string(),
            size_mb: 5900.0,
            installed: false,
        },
    ]
}

fn open_dictionary(db_path: &PathBuf) -> Result<Connection, String> {
    let conn = Connection::open_with_flags(
        db_path,
        rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .map_err(|e| format!("Failed to open dictionary: {}", e))?;
    conn.execute_batch("PRAGMA mmap_size = 268435456;")
        .map_err(|e| format!("PRAGMA failed: {}", e))?;
    Ok(conn)
}

#[tauri::command]
pub fn get_plugins(app: AppHandle) -> Result<Vec<PluginInfo>, String> {
    let mut plugins = get_plugin_manifest();
    for plugin in plugins.iter_mut() {
        let plugin_dir = get_plugin_data_path(&app, &plugin.id)?;
        let data_file = plugin_dir.join(&plugin.file_name);
        plugin.installed = data_file.exists();
    }
    Ok(plugins)
}

#[tauri::command]
pub fn uninstall_plugin(
    app: AppHandle,
    plugin_id: String,
    db: State<'_, Mutex<DictionaryDb>>,
) -> Result<(), String> {
    let plugins_dir = get_plugins_dir(&app)?;
    let plugin_dir = get_plugin_data_path(&app, &plugin_id)?;

    let canonical_plugins = plugins_dir
        .canonicalize()
        .map_err(|e| format!("Failed to canonicalize plugins dir: {}", e))?;
    let canonical_plugin = plugin_dir
        .canonicalize()
        .map_err(|_| "Plugin directory does not exist".to_string())?;

    if !canonical_plugin.starts_with(&canonical_plugins) {
        return Err("Invalid plugin path".to_string());
    }

    if plugin_dir.exists() {
        fs::remove_dir_all(&plugin_dir)
            .map_err(|e| format!("Failed to remove plugin data: {}", e))?;
    }

    if plugin_id == "terma-dictionary" {
        if let Ok(mut d) = db.lock() {
            d.conn = None;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn get_plugin_status(app: AppHandle, plugin_id: String) -> Result<bool, String> {
    let plugins = get_plugin_manifest();
    let plugin = plugins
        .iter()
        .find(|p| p.id == plugin_id)
        .ok_or_else(|| format!("Plugin not found: {}", plugin_id))?;
    let plugin_dir = get_plugin_data_path(&app, &plugin_id)?;
    let data_file = plugin_dir.join(&plugin.file_name);
    Ok(data_file.exists())
}

#[tauri::command]
pub async fn install_plugin(
    app: AppHandle,
    plugin_id: String,
    window: tauri::Window,
) -> Result<(), String> {
    let plugins = get_plugin_manifest();
    let plugin = plugins
        .iter()
        .find(|p| p.id == plugin_id)
        .ok_or_else(|| format!("Plugin not found: {}", plugin_id))?
        .clone();

    let plugin_dir = get_plugin_data_path(&app, &plugin.id)?;
    let data_file = plugin_dir.join(&plugin.file_name);

    use futures_util::StreamExt;
    use tokio::io::AsyncWriteExt;

    let response = reqwest::get(&plugin.download_url)
        .await
        .map_err(|e| format!("Download failed: {}", e))?;

    let total_size = response.content_length().unwrap_or(0);
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    let tmp_file = data_file.with_extension("tmp");
    let mut file = tokio::fs::File::create(&tmp_file)
        .await
        .map_err(|e| format!("Failed to create file: {}", e))?;

    let download_result: Result<(), String> = async {
        while let Some(chunk) = stream.next().await {
            let chunk = chunk.map_err(|e| format!("Stream error: {}", e))?;
            file.write_all(&chunk)
                .await
                .map_err(|e| format!("Write error: {}", e))?;
            downloaded += chunk.len() as u64;

            if total_size > 0 {
                let progress = (downloaded as f64 / total_size as f64 * 100.0) as u32;
                let _ = window.emit(
                    "plugin-download-progress",
                    serde_json::json!({
                        "pluginId": plugin.id,
                        "progress": progress,
                        "downloaded": downloaded,
                        "total": total_size,
                    }),
                );
            }
        }

        file.flush()
            .await
            .map_err(|e| format!("Flush error: {}", e))?;
        drop(file);

        tokio::fs::rename(&tmp_file, &data_file)
            .await
            .map_err(|e| format!("Failed to finalize download: {}", e))?;

        Ok(())
    }.await;

    if let Err(e) = &download_result {
        let _ = tokio::fs::remove_file(&tmp_file).await;
        return Err(e.clone());
    }

    let _ = window.emit(
        "plugin-installed",
        serde_json::json!({
            "pluginId": plugin.id,
        }),
    );

    Ok(())
}

#[tauri::command]
pub fn lookup_dictionary(
    app: AppHandle,
    query: String,
    db: State<'_, Mutex<DictionaryDb>>,
) -> Result<Vec<DictResult>, String> {
    let mut db = db.lock().map_err(|e| format!("DB lock failed: {}", e))?;

    if db.conn.is_none() {
        let db_path = get_dictionary_db_path(&app)?;
        if !db_path.exists() {
            return Err("Dictionary not installed".to_string());
        }
        db.conn = Some(open_dictionary(&db_path)?);
    }

    let conn = db.conn.as_ref().unwrap();
    let query_trimmed = query.trim();

    if query_trimmed.is_empty() {
        return Ok(vec![]);
    }

    // Try exact headword match first
    let mut results = exact_lookup(conn, query_trimmed)?;

    // If no exact match, try prefix match
    if results.is_empty() {
        results = prefix_lookup(conn, query_trimmed)?;
    }

    // If still nothing, fall back to FTS
    if results.is_empty() {
        results = fts_lookup(conn, query_trimmed)?;
    }

    Ok(results)
}

fn exact_lookup(conn: &Connection, query: &str) -> Result<Vec<DictResult>, String> {
    let mut stmt = conn
        .prepare_cached(
            "SELECT e.headword, e.headword_wylie, e.definition, s.code, s.name
             FROM entries e
             JOIN sources s ON e.source_id = s.id
             WHERE e.headword = ?1 OR e.headword_wylie = ?1
             LIMIT 30",
        )
        .map_err(|e| format!("Prepare failed: {}", e))?;

    let rows = stmt
        .query_map([query], |row| {
            Ok(DictResult {
                headword: row.get(0)?,
                headword_wylie: row.get(1)?,
                definition: row.get(2)?,
                source: row.get(3)?,
                source_name: row.get(4)?,
            })
        })
        .map_err(|e| format!("Query failed: {}", e))?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(results)
}

fn prefix_lookup(conn: &Connection, query: &str) -> Result<Vec<DictResult>, String> {
    let pattern = format!("{}%", query);
    let mut stmt = conn
        .prepare_cached(
            "SELECT e.headword, e.headword_wylie, e.definition, s.code, s.name
             FROM entries e
             JOIN sources s ON e.source_id = s.id
             WHERE e.headword LIKE ?1 OR e.headword_wylie LIKE ?1
             ORDER BY length(e.headword)
             LIMIT 30",
        )
        .map_err(|e| format!("Prepare failed: {}", e))?;

    let rows = stmt
        .query_map([&pattern], |row| {
            Ok(DictResult {
                headword: row.get(0)?,
                headword_wylie: row.get(1)?,
                definition: row.get(2)?,
                source: row.get(3)?,
                source_name: row.get(4)?,
            })
        })
        .map_err(|e| format!("Query failed: {}", e))?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(results)
}

fn fts_lookup(conn: &Connection, query: &str) -> Result<Vec<DictResult>, String> {
    let sanitized: String = query
        .split_whitespace()
        .map(|w| format!("\"{}\"", w.replace('"', "")))
        .collect::<Vec<_>>()
        .join(" ");

    let fts_query = format!("headword : {0} OR headword_wylie : {0}", sanitized);

    let mut stmt = conn
        .prepare_cached(
            "SELECT e.headword, e.headword_wylie, e.definition, s.code, s.name
             FROM fts_entries f
             JOIN entries e ON f.rowid = e.id
             JOIN sources s ON e.source_id = s.id
             WHERE fts_entries MATCH ?1
             ORDER BY rank
             LIMIT 30",
        )
        .map_err(|e| format!("Prepare failed: {}", e))?;

    let rows = stmt
        .query_map([&fts_query], |row| {
            Ok(DictResult {
                headword: row.get(0)?,
                headword_wylie: row.get(1)?,
                definition: row.get(2)?,
                source: row.get(3)?,
                source_name: row.get(4)?,
            })
        })
        .map_err(|e| format!("FTS query failed: {}", e))?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| format!("FTS row error: {}", e))?);
    }
    Ok(results)
}

#[tauri::command]
pub fn spellcheck_tibetan(
    app: AppHandle,
    words: Vec<String>,
    db: State<'_, Mutex<DictionaryDb>>,
) -> Result<Vec<String>, String> {
    if words.is_empty() {
        return Ok(vec![]);
    }

    let mut db = db.lock().map_err(|e| format!("DB lock failed: {}", e))?;

    if db.conn.is_none() {
        let db_path = get_dictionary_db_path(&app)?;
        if !db_path.exists() {
            // Dictionary not installed — treat all words as valid (no false positives)
            return Ok(vec![]);
        }
        db.conn = Some(open_dictionary(&db_path)?);
    }

    let conn = db.conn.as_ref().unwrap();
    let mut stmt = conn
        .prepare_cached("SELECT EXISTS(SELECT 1 FROM entries WHERE headword = ?1)")
        .map_err(|e| format!("Prepare failed: {}", e))?;

    let mut misspelled = Vec::new();
    for word in &words {
        let trimmed = word.trim();
        if trimmed.is_empty() {
            continue;
        }
        let exists: bool = stmt
            .query_row([trimmed], |row| row.get(0))
            .map_err(|e| format!("Query failed: {}", e))?;
        if !exists {
            misspelled.push(word.clone());
        }
    }

    Ok(misspelled)
}

#[tauri::command]
pub fn get_dictionary_sources(
    app: AppHandle,
    db: State<'_, Mutex<DictionaryDb>>,
) -> Result<Vec<serde_json::Value>, String> {
    let mut db = db.lock().map_err(|e| format!("DB lock failed: {}", e))?;

    if db.conn.is_none() {
        let db_path = get_dictionary_db_path(&app)?;
        if !db_path.exists() {
            return Err("Dictionary not installed".to_string());
        }
        db.conn = Some(open_dictionary(&db_path)?);
    }

    let conn = db.conn.as_ref().unwrap();
    let mut stmt = conn
        .prepare("SELECT code, name, description, entry_count FROM sources")
        .map_err(|e| format!("Prepare failed: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "code": row.get::<_, String>(0)?,
                "name": row.get::<_, String>(1)?,
                "description": row.get::<_, Option<String>>(2)?,
                "entry_count": row.get::<_, i64>(3)?,
            }))
        })
        .map_err(|e| format!("Query failed: {}", e))?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| format!("Row error: {}", e))?);
    }
    Ok(results)
}
