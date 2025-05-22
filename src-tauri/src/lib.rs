// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

                let ctrl_n_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyN);
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new().with_handler(move |_app, shortcut, event| {
                        println!("{:?}", shortcut);
                        if shortcut == &ctrl_n_shortcut {
                            match event.state() {
                            ShortcutState::Pressed => {
                                println!("Ctrl-N Pressed!");
                            }
                            ShortcutState::Released => {
                                println!("Ctrl-N Released!");
                            }
                            }
                        }
                    })
                    .build(),
                )?;

                app.global_shortcut().register(ctrl_n_shortcut)?;
            }
            Ok(())
        })
        // .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
