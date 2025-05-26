import { FormItem, Input } from 'cui-solid'
import { createSignal, For } from 'solid-js'
import icon from '../public/icon.png'

function App() {
  const [state, setState] = createSignal({
    sk: '',
    cList: [],
  })

  return (
    <main w-screen h-screen bg-white p-20>
      <div w-full flex gap-20 items-center>
        <img src={icon} w-50 h-50 />
        <p text-20 m-0>Fast Paest</p>
      </div>
      <div mt-20>
        <FormItem label="sk:">
          <Input
            type="password"
            value={state().sk}
            onInput={sk => setState({ ...state(), sk })}
          />
        </FormItem>
        <div>
          <For each={state().cList}>
            {
              (item, i) => (
                <div>i</div>
              )
            }
          </For>
        </div>
      </div>
    </main>
  )
}

export default App
