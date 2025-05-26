import type { TrayIconOptions } from '@tauri-apps/api/tray'
import { TrayIcon } from '@tauri-apps/api/tray'
/* @refresh reload */
import { render } from 'solid-js/web'
import App from './App'
import tray_init from './tray'

import './style.css'
import 'virtual:uno.css'
import 'cui-solid/dist/styles/cui.css'

// tray_init()

render(() => <App />, document.getElementById('root') as HTMLElement)
