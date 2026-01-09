use tauri::{tray::TrayIconBuilder, AppHandle, Manager, Window};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use arboard::Clipboard;
use enigo::{
    Button, Coordinate,
    Direction::{Click, Press, Release},
    Enigo, Key, Keyboard, Mouse, Settings,
};

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
            let main_window = app.get_webview_window("main").unwrap();
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSWindow, NSWindowTitleVisibility};
                use cocoa::base::{id, YES, NO};
                use tauri::ActivationPolicy;
                app.set_activation_policy(ActivationPolicy::Accessory);
                unsafe {
                    use cocoa::appkit::{NSWindowCollectionBehavior, NSWindowStyleMask};
                    let ns_win = main_window.ns_window().unwrap() as id;
                    ns_win.setLevel_(25);
                }
            }

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
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_positioner::init())
        .on_tray_icon_event(|app, event| tauri_plugin_positioner::on_tray_event(app, &event))
        .invoke_handler(tauri::generate_handler![greet, set_key])
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
