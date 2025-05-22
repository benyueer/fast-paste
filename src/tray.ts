/* eslint-disable no-console */
import type { TrayIconOptions } from '@tauri-apps/api/tray'
import { defaultWindowIcon } from '@tauri-apps/api/app'
import { Image as ImageApi } from '@tauri-apps/api/image'
import { Menu } from '@tauri-apps/api/menu'
import { TrayIcon } from '@tauri-apps/api/tray'
import { getAllWebviewWindows, getCurrentWebviewWindow, WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { getAllWindows, getCurrentWindow, Window } from '@tauri-apps/api/window'
import icon from '../public/icon.png'

async function getImgArray() {
  const res = await fetch(icon)
  const arrayBuffer = await res.arrayBuffer()
  const image = await ImageApi.fromBytes(arrayBuffer)
  return image
}

export async function getWindow(label: string) {
  return await WebviewWindow.getByLabel(label)
}

export async function getAllWin() {
  //  return getAll()
  return await getAllWindows()
}

export default async function tray_init() {
  const menu = await Menu.new({
    items: [
      {
        id: 'info',
        text: '关于',
        action: () => {
          console.log('info press')
        },
      },
      {
        id: 'quit',
        text: '退出',
        action: async () => {
          // 退出逻辑
          const appWindow = await getWindow('main')
          appWindow?.close()
        },
      },
    ],
  })

  const imgArray2 = await getImgArray()
  const options: TrayIconOptions = {
    icon: imgArray2,
    tooltip: 'fast-paste',
    menu,
    menuOnLeftClick: false,
    // 托盘行为
    action: async (event) => {
      switch (event.type) {
        case 'Click':
          console.log(
            `mouse ${event.button} button pressed, state: ${event.buttonState}`,
          )
          // eslint-disable-next-line no-case-declarations
          const appWindow = await getWindow('main')
          if (!await appWindow?.isVisible()) {
            await appWindow?.show()
            await appWindow?.unminimize()
            await appWindow?.setFocus()
          }
          break
        case 'DoubleClick':
          console.log(`mouse ${event.button} button pressed`)
          break
        case 'Enter':
          console.log(
            `mouse hovered tray at ${event.rect.position.x}, ${event.rect.position.y}`,
          )
          break
        case 'Move':
          console.log(
            `mouse moved on tray at ${event.rect.position.x}, ${event.rect.position.y}`,
          )
          break
        case 'Leave':
          console.log(
            `mouse left tray at ${event.rect.position.x}, ${event.rect.position.y}`,
          )
          break
      }
    },
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  const tray = await TrayIcon.new(options)
}
