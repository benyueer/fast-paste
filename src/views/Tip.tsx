import { onMount, onCleanup, createSignal, For } from "solid-js";
import Vditor from "vditor";
import { Avatar, Button, Input, message, RadioGroup, Space } from "cui-solid";
import "vditor/dist/index.css";
import { join, appDataDir } from "@tauri-apps/api/path";
import {
  writeTextFile,
  mkdir,
  readTextFile,
  exists,
  readDir,
} from "@tauri-apps/plugin-fs";

type EditorMode = "wysiwyg" | "ir" | "sv";
type AllMode = EditorMode | "preview";

const isFileExist = async (filename: string) => {
  const appDir = await appDataDir();
  const filePath = await join(appDir, filename);
  return await exists(filePath);
};

const getFileList = async () => {
  const appDir = await appDataDir();
  const files = await readDir(appDir);
  const mdFiles = files.filter(
    (file) => file.name.endsWith(".md") && file.isFile,
  );
  return mdFiles.map((file) => file.name);
};

const getFileContent = async (fileName: string) => {
  const appDir = await appDataDir();
  const filePath = await join(appDir, fileName);
  if (!(await exists(filePath))) {
    await mkdir(appDir, { recursive: true });
    await writeTextFile(filePath, "");
    return "";
  }
  const content = await readTextFile(filePath);
  return content;
};

const saveFileContent = async (fileName: string, content: string) => {
  const appDir = await appDataDir();
  const filePath = await join(appDir, fileName);
  await writeTextFile(filePath, content);
};

export default function Tip() {
  let vditor: Vditor | null = null;
  let editorRef: HTMLDivElement | undefined;
  const [mode, setMode] = createSignal<AllMode>("wysiwyg");
  const [isPreview, setIsPreview] = createSignal(true);
  const [fileList, setFileList] = createSignal<string[]>([]);
  const [curFile, setCurFile] = createSignal<string>("");
  const [isAdding, setIsAdding] = createSignal(false);
  const [addFilename, setAddFilename] = createSignal("");

  const initFilelist = async () => {
    const list = await getFileList();
    setFileList(list);
    if (list.length > 0 && !curFile()) {
      setCurFile(list[0]);
    }
  };

  // const modeButtons = [
  //   { value: 'wysiwyg', label: '所见即所得' },
  //   { value: 'ir', label: '即时渲染' },
  //   { value: 'sv', label: '编辑器' },
  //   { value: 'preview', label: '预览' },
  // ]

  const initEditor = async () => {
    if (editorRef) {
      vditor?.destroy();
      editorRef.innerHTML = "";
      editorRef.className = "";
      const content = await getFileContent(curFile());
      if (isPreview()) {
        Vditor.preview(editorRef, content, { mode: "dark" });
      } else {
        vditor = new Vditor(editorRef, {
          height: "100%",
          value: content,
          mode: "wysiwyg",
          cache: {
            enable: false,
          },
          placeholder: "Type your markdown here...",
          // preview: {
          //   hljs: {
          //     style: 'github',
          //     lineNumber: true,
          //   },
          //   mode: isPreview() ? 'both' : 'editor',
          // },
          toolbar: !isPreview()
            ? [
                "emoji",
                "headings",
                "bold",
                "italic",
                "strike",
                "link",
                "|",
                "list",
                "ordered-list",
                "check",
                "outdent",
                "indent",
                "|",
                "quote",
                "line",
                "code",
                "inline-code",
                "table",
                "|",
                "undo",
                "redo",
                "|",
                "preview",
                "fullscreen",
              ]
            : [],
        });
      }
    }
  };

  onMount(async () => {
    await initFilelist();
    if (curFile()) {
      initEditor();
    }
  });

  onCleanup(() => {
    if (vditor) {
      vditor.destroy();
    }
  });

  const handlerPreview = async () => {
    if (vditor) {
      await saveFileContent(curFile(), vditor.getValue());
    }
    setIsPreview(!isPreview());
    initEditor();
  };

  const handlerAddFile = async () => {
    if (!addFilename()) return;
    const isExist = await isFileExist(addFilename());
    if (isExist) {
      message.error("文件已存在");
      return;
    }
    let filename = addFilename();
    if (!filename.endsWith(".md")) {
      filename += ".md";
    }
    await saveFileContent(filename, " ");
    await initFilelist();
    setCurFile(filename);
    setIsAdding(false);
    setAddFilename("");
    initEditor();
    message.success("添加成功");
  };

  return (
    <div relative w-full h-full>
      <div
        w-full
        h-40
        bg-slate-800
        px-10
        flex
        items-center
        justify-between
        data-tauri-drag-region
        cursor-grab
      >
        <div h-full max-w="[80%]" flex items-center gap-4>
          <For each={fileList()}>
            {(item) => (
              <Button
                theme="solid"
                type="primary"
                size="small"
                style={{
                  color: item === curFile() ? "black" : "white",
                  background: item === curFile() ? "white" : "black",
                }}
                onClick={() => {
                  if (curFile() === item) return;
                  setCurFile(item);
                  initEditor();
                }}
              >
                {item}
              </Button>
            )}
          </For>
          {isAdding() && (
            <div flex gap-2 items-center>
              <Input
                value={addFilename()}
                size="small"
                onChange={(value) => setAddFilename(value)}
                placeholder="请输入文件名"
                maxLength={20}
              ></Input>
              <Button size="small" onClick={handlerAddFile}>
                ✅
              </Button>
              <Button size="small" onClick={() => setIsAdding(false)}>
                ❌
              </Button>
            </div>
          )}
        </div>
        <div flex items-center gap-4>
          <Button
            theme="solid"
            type="primary"
            size="small"
            onClick={handlerPreview}
          >
            {isPreview() ? "编辑" : "预览"}
          </Button>
          <Button
            theme="solid"
            type="primary"
            size="small"
            onClick={() => setIsAdding(true)}
          >
            +
          </Button>
        </div>
      </div>
      <div w-full h="[calc(100%-40px)]" flex-1>
        <div w-full h-full ref={editorRef} id="vditor" />
      </div>
    </div>
  );
}
