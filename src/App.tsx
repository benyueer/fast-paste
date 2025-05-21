import { invoke } from '@tauri-apps/api/core'
import { createSignal } from 'solid-js'

function App() {
  const [_greetMsg, setGreetMsg] = createSignal('')
  const [name, _setName] = createSignal('')

  async function _greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke('greet', { name: name() }))
  }

  return (
    <main class="bg-red-500 h-screen">
      <div class="p-4">
        <h1 class="text-14 font-bold text-white">Fast Paste</h1>
      </div>
    </main>
  )
}

export default App
