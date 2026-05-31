use rusqlite::Connection;
use serde::Serialize;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

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

fn get_dictionary_db_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let resource_path = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;
    Ok(resource_path.join("resources").join("terma-dictionary.db"))
}

fn open_dictionary(db_path: &std::path::PathBuf) -> Result<Connection, String> {
    let conn = Connection::open_with_flags(
        db_path,
        rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .map_err(|e| format!("Failed to open dictionary: {}", e))?;
    conn.execute_batch("PRAGMA mmap_size = 268435456;")
        .map_err(|e| format!("PRAGMA failed: {}", e))?;
    Ok(conn)
}

fn ensure_connection(
    app: &AppHandle,
    db: &mut DictionaryDb,
) -> Result<(), String> {
    if db.conn.is_none() {
        let db_path = get_dictionary_db_path(app)?;
        if !db_path.exists() {
            return Err(format!("Dictionary not found at {:?}", db_path));
        }
        db.conn = Some(open_dictionary(&db_path)?);
    }
    Ok(())
}

#[tauri::command]
pub fn lookup_dictionary(
    app: AppHandle,
    query: String,
    db: State<'_, Mutex<DictionaryDb>>,
) -> Result<Vec<DictResult>, String> {
    let mut db = db.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    ensure_connection(&app, &mut db)?;

    let conn = db.conn.as_ref().unwrap();
    let query_trimmed = query.trim();

    if query_trimmed.is_empty() {
        return Ok(vec![]);
    }

    let mut results = exact_lookup(conn, query_trimmed)?;

    if results.is_empty() {
        results = prefix_lookup(conn, query_trimmed)?;
    }

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
    ensure_connection(&app, &mut db)?;

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
    ensure_connection(&app, &mut db)?;

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
