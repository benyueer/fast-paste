use tauri::AppHandle;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use enigo::{
    Button, Coordinate,
    Direction::{Click, Press, Release},
    Enigo, Key, Keyboard, Mouse, Settings,
};
use arboard::Clipboard;

pub fn set_clipboard(text: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut clipboard = Clipboard::new()?;
    clipboard.set_text(text)?;
    Ok(())
}

/**
 * 在 setup 中初始化 快捷键 handler
 * 提供 command init，表示用户输入 key 和 iv 功能初始化
 * 提供 command: update_key add_key remove_key 
 */

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn set_key(app: AppHandle, key: &str) {
    println!("{:?}", key);
    let s_key: Code = key.parse().unwrap();
    let ctrl_n_shortcut = Shortcut::new(Some(Modifiers::CONTROL), s_key);
    let shortcut_manager = app.global_shortcut();
    let _ = shortcut_manager.register(ctrl_n_shortcut);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                // let ctrl_n_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyN);
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, shortcut, event| {
                            println!("{:?}", shortcut);
                            if shortcut.matches(Modifiers::CONTROL, Code::KeyQ) {
                                println!("KeyQ");
                                let mut enigo = Enigo::new(&Settings::default()).unwrap();
                                set_clipboard("hello world").unwrap();
                                let _ = enigo.key(Key::Meta, Press);
                                let _ = enigo.key(Key::Unicode('v'), Click);
                                let _ = enigo.key(Key::Meta, Release);
                            }
                        })
                        .build(),
                )?;

                // app.global_shortcut().register(ctrl_n_shortcut)?;
            }
            Ok(())
        })
        // .plugin(tauri_plugin_global_shortcut::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, set_key])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
