mod commands;
mod dictionary;
mod docx;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(dictionary::DictionaryDb::new())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler({
            #[cfg(debug_assertions)]
            {
                tauri::generate_handler![
                    commands::new_document,
                    commands::read_file,
                    commands::write_file,
                    commands::debug_docx,
                    dictionary::lookup_dictionary,
                    dictionary::get_dictionary_sources,
                    dictionary::spellcheck_tibetan,
                ]
            }
            #[cfg(not(debug_assertions))]
            {
                tauri::generate_handler![
                    commands::new_document,
                    commands::read_file,
                    commands::write_file,
                    dictionary::lookup_dictionary,
                    dictionary::get_dictionary_sources,
                    dictionary::spellcheck_tibetan,
                ]
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
