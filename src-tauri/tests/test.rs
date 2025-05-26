
#[cfg(test)]
pub mod test {
    use arboard::Clipboard;
    use enigo::{Enigo, Key, Keyboard, Settings, Direction::{Click, Press, Release}};

    #[test]
    pub fn test_set_clipboard() {
        let mut enigo = Enigo::new(&Settings::default()).unwrap();
        use fast_paste_lib::set_clipboard;
        set_clipboard("hello world").unwrap();
        let mut clipboard = Clipboard::new().unwrap();
        let text = clipboard.get_text().unwrap();
        println!("{}", text);   

        let _ = enigo.key(Key::Meta, Press);
        let _ = enigo.key(Key::Unicode('v'), Click);
        let _ = enigo.key(Key::Meta, Release);
    }
}