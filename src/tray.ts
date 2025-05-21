import { Menu } from '@tauri-apps/api/menu'
import { TrayIcon } from '@tauri-apps/api/tray'
import icon from '../public/image.png'

function getImgArray() {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = icon
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, img.width, img.height)
      const uint8Array = new Uint8Array(imgData.data)
      resolve(uint8Array)
    }
  })
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
        action: () => {
          // 退出逻辑
          const appWindow = new Window('main')
          appWindow.close()
        },
      },
    ],
  })

  const imgArray = await getImgArray()
  console.log(imgArray)

  const options = {
    icon: imgArray,
    menu,
    menuOnLeftClick: false,
    // 托盘行为
    action: (event) => {
      switch (event.type) {
        case 'Click':
          console.log(
            `mouse ${event.button} button pressed, state: ${event.buttonState}`,
          )
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

  const tray = await TrayIcon.new(options)
}
