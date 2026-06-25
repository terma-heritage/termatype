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

/// Candidate locations for the bundled dictionary, in priority order. Different
/// bundlers place it differently:
///  - Tauri MSI/NSIS/dmg + the MSIX packer keep the declared `resources/`
///    subfolder: `<resource_dir>/resources/terma-dictionary.db`.
///  - The Mac App Store assembly (appstore.yml) copies it flat into
///    `Contents/Resources`, i.e. `<resource_dir>/terma-dictionary.db`.
/// Checking both means the dictionary works no matter which path is used.
fn dictionary_db_candidates(app: &AppHandle) -> Result<Vec<std::path::PathBuf>, String> {
    let resource_path = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;
    Ok(vec![
        resource_path.join("resources").join("terma-dictionary.db"),
        resource_path.join("terma-dictionary.db"),
    ])
}

fn open_dictionary(db_path: &std::path::PathBuf) -> Result<Connection, String> {
    // The bundled DB ships in DELETE (rollback) journal mode, NOT WAL — see
    // build_dictionary.py and the `shipped_db_is_not_wal_mode` test. A clean
    // DELETE-mode DB opens read-only from a read-only directory with no side
    // files, so a plain read-only open is all that's needed. (A WAL-mode DB
    // would fail here because it must create -wal/-shm files; that was the
    // App Store / MSIX dictionary bug.)
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
        let candidates = dictionary_db_candidates(app)?;
        let db_path = candidates
            .iter()
            .find(|p| p.exists())
            .ok_or_else(|| format!("Dictionary not found. Checked: {:?}", candidates))?;
        db.conn = Some(open_dictionary(db_path)?);
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

    let conn = db.conn.as_ref().ok_or_else(|| "Database connection lost".to_string())?;
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

    let conn = db.conn.as_ref().ok_or_else(|| "Database connection lost".to_string())?;
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn bundled_db() -> PathBuf {
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("resources")
            .join("terma-dictionary.db")
    }

    /// The shipped DB must be in DELETE (rollback) journal mode, never WAL.
    /// A WAL-mode DB cannot be opened read-only from a read-only directory
    /// (it must create -wal/-shm side files), which breaks store installs.
    #[test]
    fn shipped_db_is_not_wal_mode() {
        let bytes = std::fs::read(bundled_db()).expect("read db header");
        // SQLite header offsets 18 & 19 are the file-format read/write versions:
        // 1 = legacy (rollback/DELETE), 2 = WAL.
        assert_eq!(bytes[18], 1, "DB write-version is WAL (2); must be 1/DELETE");
        assert_eq!(bytes[19], 1, "DB read-version is WAL (2); must be 1/DELETE");
    }

    /// Open via the real production path and confirm all three lookup
    /// strategies return data — proves the WAL→DELETE conversion didn't
    /// corrupt the database.
    #[test]
    fn lookups_work_against_shipped_db() {
        let conn = open_dictionary(&bundled_db()).expect("open dictionary");

        // Pull a real headword straight from the DB so the test never depends
        // on hardcoded content that could change when the DB is rebuilt.
        let sample: String = conn
            .query_row(
                "SELECT headword FROM entries WHERE length(headword) >= 6 LIMIT 1",
                [],
                |row| row.get(0),
            )
            .expect("fetch a sample headword");

        let exact = exact_lookup(&conn, &sample).expect("exact lookup");
        assert!(!exact.is_empty(), "exact lookup of a real headword returned nothing");

        // Prefix of that same headword must also match (at least the row itself).
        let prefix_q: String = sample.chars().take(3).collect();
        let prefix = prefix_lookup(&conn, &prefix_q).expect("prefix lookup");
        assert!(!prefix.is_empty(), "prefix lookup returned nothing");

        // FTS path: 'buddha' is well-attested in the English-Tibetan source.
        let fts = fts_lookup(&conn, "buddha").expect("fts lookup");
        assert!(!fts.is_empty(), "expected FTS matches for 'buddha'");
    }

    /// The decisive read-only-media test: open the DB from its own directory,
    /// run queries, and assert SQLite created NO -wal/-shm side files. If no
    /// side files are needed, the directory never has to be writable — which
    /// is exactly the App Store / MSIX condition.
    #[test]
    fn open_creates_no_side_files() {
        let dir = std::env::temp_dir().join(format!("termadict-test-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let db_copy = dir.join("terma-dictionary.db");
        std::fs::copy(bundled_db(), &db_copy).unwrap();

        {
            let conn = open_dictionary(&db_copy).expect("open copy");
            let _ = exact_lookup(&conn, "sangs rgyas").expect("query");
            let _ = fts_lookup(&conn, "buddha").expect("fts query");
        }

        let wal = dir.join("terma-dictionary.db-wal");
        let shm = dir.join("terma-dictionary.db-shm");
        let made_wal = wal.exists();
        let made_shm = shm.exists();
        let _ = std::fs::remove_dir_all(&dir);

        assert!(!made_wal, "a -wal side file was created (needs writable dir)");
        assert!(!made_shm, "a -shm side file was created (needs writable dir)");
    }
}

#[tauri::command]
pub fn get_dictionary_sources(
    app: AppHandle,
    db: State<'_, Mutex<DictionaryDb>>,
) -> Result<Vec<serde_json::Value>, String> {
    let mut db = db.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    ensure_connection(&app, &mut db)?;

    let conn = db.conn.as_ref().ok_or_else(|| "Database connection lost".to_string())?;
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
