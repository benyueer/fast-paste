import { Button, Input, Popover, Space } from 'cui-solid'
import { createSignal, For, Show } from 'solid-js'

export default function Paste() {
  const [pList, setPList] = createSignal([
    {
      key: 'CommandOrControl+Shift+C',
      value: '复制',
    },
    {
      key: 'CommandOrControl+Shift+V',
      value: '粘贴',
    },
    {
      key: 'CommandOrControl+Shift+X',
      value: '剪切',
    },
    {
      key: 'CommandOrControl+Shift+A',
      value: '全选',
    },
  ])

  const [editIndex, setEditIndex] = createSignal(1)

  return (
    <div w-full h-full p-20 overflow-auto>
      <For each={pList()}>
        {({ key, value }, index) => (
          <div px-16 py-6 flex justify-between gap-10 bg-gray-50 odd:bg-gray-100 transition-all-300 mt-4 rounded-4 class="hover:!bg-gray-200" items-center>
            <div flex items-center gap-10>
              <div w-300>
                <Show
                  when={index() === editIndex()}
                  fallback={<div>{key}</div>}
                >
                  <Input value={[key]} />
                </Show>
              </div>
              <div>{value}</div>
            </div>
            <div>
              <Space>
                <Button type="primary" size="small">编辑</Button>
                <Popover
                  trigger="click"
                  title="删除"
                  align="topRight"
                  arrow
                  content={(
                    <>
                      <div>确定删除吗？</div>
                      <Space>
                        <Button type="primary" size="small">确定</Button>
                        <Button type="primary" size="small">取消</Button>
                      </Space>
                    </>
                  )}
                >
                  <Button type="danger" size="small">删除</Button>
                </Popover>
              </Space>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}
