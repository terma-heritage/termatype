mod assistant;
mod backend;
mod commands;
mod docx;
mod plugins;
mod translator;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(backend::create_shared_backend())
        .manage(assistant::create_shared_assistant())
        .manage(translator::create_shared_translator())
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
                    plugins::spellcheck_tibetan,
                    assistant::load_assistant,
                    assistant::unload_assistant,
                    assistant::get_assistant_state,
                    assistant::transform_text,
                    translator::load_translator,
                    translator::unload_translator,
                    translator::get_translator_state,
                    translator::translate_text,
                    translator::get_system_info,
                    translator::open_external_url,
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
                    plugins::spellcheck_tibetan,
                    assistant::load_assistant,
                    assistant::unload_assistant,
                    assistant::get_assistant_state,
                    assistant::transform_text,
                    translator::load_translator,
                    translator::unload_translator,
                    translator::get_translator_state,
                    translator::translate_text,
                    translator::get_system_info,
                    translator::open_external_url,
                ]
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
