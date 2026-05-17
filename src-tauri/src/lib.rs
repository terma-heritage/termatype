mod assistant;
mod commands;
mod docx;
mod plugins;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(assistant::create_shared_assistant())
        .manage(plugins::DictionaryDb::new())
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
                    plugins::get_plugins,
                    plugins::install_plugin,
                    plugins::uninstall_plugin,
                    plugins::get_plugin_status,
                    plugins::lookup_dictionary,
                    plugins::get_dictionary_sources,
                    assistant::load_assistant,
                    assistant::unload_assistant,
                    assistant::get_assistant_state,
                    assistant::transform_text,
                ]
            }
            #[cfg(not(debug_assertions))]
            {
                tauri::generate_handler![
                    commands::new_document,
                    commands::read_file,
                    commands::write_file,
                    plugins::get_plugins,
                    plugins::install_plugin,
                    plugins::uninstall_plugin,
                    plugins::get_plugin_status,
                    plugins::lookup_dictionary,
                    plugins::get_dictionary_sources,
                    assistant::load_assistant,
                    assistant::unload_assistant,
                    assistant::get_assistant_state,
                    assistant::transform_text,
                ]
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
