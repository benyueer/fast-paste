import { onMount, onCleanup, createSignal, For, batch } from "solid-js";
import Vditor from "vditor";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Input,
  message,
  Modal,
  modal,
  RadioGroup,
  Space,
} from "cui-solid";
import "vditor/dist/index.css";
import { join, appDataDir } from "@tauri-apps/api/path";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  writeTextFile,
  mkdir,
  readTextFile,
  exists,
  readDir,
  remove,
} from "@tauri-apps/plugin-fs";

type EditorMode = "wysiwyg" | "ir" | "sv";
type AllMode = EditorMode | "preview";

const isFileExist = async (filename: string) => {
  const appDir = await appDataDir();
  console.log(appDir);
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
  console.log(`[AutoSave] Saved ${fileName}`);
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
  let inputRef: any;

  const initFilelist = async () => {
    const list = await getFileList();
    setFileList(list);
    if (list.length > 0 && !curFile()) {
      setCurFile(list[0]);
    }
  };

  const saveFile = async () => {
    if (vditor && !isPreview()) {
      const content = vditor.getValue();
      if (content) {
        await saveFileContent(curFile(), content);
        console.log(
          `[AutoSave] Saved ${curFile()} at ${new Date().toLocaleTimeString()}`,
        );
      }
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
          mode: "sv",
          cache: {
            enable: false,
          },
          preview: {
            mode: "editor",
          },
          placeholder: "Type your markdown here...",
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
    let filename = addFilename();
    if (!filename.endsWith(".md")) {
      filename += ".md";
    }
    const isExist = await isFileExist(filename);
    if (isExist) {
      message.error("文件已存在");
      return;
    }
    try {
      await saveFileContent(filename, " ");
      const list = await getFileList();
      batch(() => {
        setFileList(list);
        setCurFile(filename);
        setAddFilename("");
      });
      // 延迟处理 UI 切换，确保事件冒泡和 DOM 更新不会产生冲突
      setTimeout(() => {
        setIsAdding(false);
        initEditor();
      }, 50);
      message.success("添加成功");
    } catch (e) {
      console.error(e);
      message.error("添加失败");
    }
  };

  const handlerOpenFolder = async () => {
    const appDir = await appDataDir();
    await revealItemInDir(appDir);
  };

  const handlerDeleteFile = async (fileName: string) => {
    modal.confirm({
      title: "确认删除",
      content: `确定要删除文件 ${fileName} 吗？`,
      onOk: async () => {
        try {
          const appDir = await appDataDir();
          const filePath = await join(appDir, fileName);
          await remove(filePath);
          message.success("删除成功");

          const list = await getFileList();
          batch(() => {
            setFileList(list);
            if (curFile() === fileName) {
              if (list.length > 0) {
                setCurFile(list[0]);
              } else {
                setCurFile("");
              }
            }
          });

          if (curFile() !== fileName || list.length === 0) {
            setTimeout(() => {
              initEditor();
            }, 0);
          }
        } catch (e) {
          message.error("删除失败");
        }
      },
    });
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
          <For each={fileList().slice(0, 3)}>
            {(item) => (
              <Dropdown
                trigger="contextMenu"
                align="bottomLeft"
                onSelect={(name) => {
                  if (name === "delete") {
                    handlerDeleteFile(item);
                  }
                }}
                menu={
                  <DropdownMenu>
                    <DropdownItem name="delete" theme="error">
                      删除文件
                    </DropdownItem>
                  </DropdownMenu>
                }
              >
                <Button
                  theme="solid"
                  type="primary"
                  size="small"
                  style={{
                    color: item === curFile() ? "black" : "white",
                    background: item === curFile() ? "white" : "black",
                  }}
                  onClick={async () => {
                    if (curFile() === item) return;
                    if (vditor) {
                      await saveFileContent(curFile(), vditor!.getValue());
                    }
                    setCurFile(item);
                    initEditor();
                  }}
                >
                  {item}
                </Button>
              </Dropdown>
            )}
          </For>
          {fileList().length > 3 && (
            <Dropdown
              align="bottomLeft"
              onSelect={async (name) => {
                if (vditor) {
                  await saveFileContent(curFile(), vditor!.getValue());
                }
                setCurFile(name);
                initEditor();
              }}
              menu={
                <DropdownMenu>
                  <For each={fileList().slice(3)}>
                    {(item) => (
                      <DropdownItem name={item} selected={item === curFile()}>
                        {item}
                      </DropdownItem>
                    )}
                  </For>
                </DropdownMenu>
              }
            >
              <Button theme="solid" type="primary" size="small">
                ...
              </Button>
            </Dropdown>
          )}
          {isAdding() && (
            <div flex gap-2 items-center>
              <Input
                ref={(el) => {
                  inputRef = el;
                  if (el) {
                    setTimeout(() => el.focus(), 100);
                  }
                }}
                value={addFilename()}
                size="small"
                onChange={(value) => setAddFilename(value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlerAddFile();
                  }
                }}
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
          <Dropdown
            align="bottomRight"
            onSelect={(name) => {
              if (name === "add") {
                setIsAdding(true);
              } else if (name === "openFolder") {
                handlerOpenFolder();
              } else if (name === "save") {
                saveFile();
              } else if (name === "refresh") {
                initFilelist();
                message.success("列表已刷新");
              }
            }}
            menu={
              <DropdownMenu>
                <DropdownItem name="add">添加文件</DropdownItem>
                <DropdownItem name="save">保存</DropdownItem>
                <DropdownItem name="refresh">刷新列表</DropdownItem>
                <DropdownItem name="openFolder">打开文件夹</DropdownItem>
              </DropdownMenu>
            }
          >
            <Button theme="solid" type="primary" size="small">
              +
            </Button>
          </Dropdown>
        </div>
      </div>
      <div w-full h="[calc(100%-40px)]" flex-1>
        <div w-full h-full ref={editorRef} id="vditor" />
      </div>
    </div>
  );
}
