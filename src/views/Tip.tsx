import { onMount, onCleanup, createSignal } from 'solid-js'
import Vditor from 'vditor'
import { Avatar, RadioGroup, Space } from "cui-solid"
import 'vditor/dist/index.css'
import { join, appDataDir } from '@tauri-apps/api/path'
import { writeTextFile, mkdir, readTextFile, exists } from '@tauri-apps/plugin-fs'

type EditorMode = 'wysiwyg' | 'ir' | 'sv'
type AllMode = EditorMode | 'preview'

const fileName = 'tip.md'

const getFileContent = async () => {
  const appDir = await appDataDir()
  const filePath = await join(appDir, fileName)
  if (!(await exists(filePath))) {
    await mkdir(appDir, { recursive: true })
    await writeTextFile(filePath, '')
    return ''
  }
  const content = await readTextFile(filePath)
  return content
}

const saveFileContent = async (content: string) => {
  const appDir = await appDataDir()
  const filePath = await join(appDir, fileName)
  await writeTextFile(filePath, content)
}

export default function Tip() {
  let vditor: Vditor | null = null
  let editorRef: HTMLDivElement | undefined
  const [mode, setMode] = createSignal<AllMode>('wysiwyg')
  const [isPreview, setIsPreview] = createSignal(false)

  const switchMode = async (newMode: AllMode) => {
    if (vditor && mode() !== newMode) {
      await saveFileContent(vditor.getValue())
      if (newMode === 'preview') {
        setIsPreview(true)
        setMode('sv')
      } else {
        setIsPreview(false)
        setMode(newMode)
      }
      vditor.destroy()
      await initEditor()
    }
  }

  const modeButtons = [
    { value: 'wysiwyg', label: '所见即所得' },
    { value: 'ir', label: '即时渲染' },
    { value: 'sv', label: '编辑器' },
    { value: 'preview', label: '预览' },
  ]

  const initEditor = async () => {
    if (editorRef) {
      const content = await getFileContent()
      vditor = new Vditor(editorRef, {
        height: '100%',
        value: content,
        mode: mode() as 'wysiwyg' | 'ir' | 'sv',
        cache: {
          enable: false,
        },
        placeholder: 'Type your markdown here...',
        preview: {
          hljs: {
            style: 'github',
            lineNumber: true,
          },
          mode: isPreview() ? 'both' : 'editor',
        },
        toolbar: [
          'emoji',
          'headings',
          'bold',
          'italic',
          'strike',
          'link',
          '|',
          'list',
          'ordered-list',
          'check',
          'outdent',
          'indent',
          '|',
          'quote',
          'line',
          'code',
          'inline-code',
          'table',
          '|',
          'undo',
          'redo',
          '|',
          'preview',
          'fullscreen',
        ],
        after: () => {
          console.log('Vditor is ready')
        },
      })
    }
  }

  onMount(() => {
    initEditor()
  })

  onCleanup(() => {
    if (vditor) {
      vditor.destroy()
    }
  })

  return (
    <div w-full h-full border="1px solid #e5e7eb" flex="~ col">
      <div flex="~" p-2 gap-2 border-b="1px solid #e5e7eb">
        <RadioGroup stick value={mode()} data={modeButtons} onChange={(value) => switchMode(value as EditorMode)} />
      </div>
      <div w-full flex-1>
        <div w-full h-full ref={editorRef} id="vditor" />
      </div>
    </div>
  )
}
