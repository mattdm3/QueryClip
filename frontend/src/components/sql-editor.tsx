import Editor, { Monaco } from "@monaco-editor/react";
import { useRef } from "react";
import { BiRightArrow } from "react-icons/bi";

export const SqlEditor = ({
  onChange,
  val,
  onSubmit,
}: {
  onChange: (s?: string) => void;
  val: string;
  onSubmit: (s: string) => void;
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Register the command for Cmd + Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const selectedText = editor
        .getModel()
        .getValueInRange(editor.getSelection());
      const textToSubmit = selectedText || editor.getValue();
      onSubmit(textToSubmit);
    });
  };
  return (
    <div className="max-w-md min-w-full  border rounded-lg py-1">
      <div className="border-b font-medium font-sans text-left py-3 px-4   border-b-slate-200">
        <div className="flex justify-between">
          <span>SQL Editor</span>
          <button
            onClick={() => {
              const selectedText = editorRef.current
                ?.getModel()
                .getValueInRange(editorRef.current.getSelection());
              const textToSubmit =
                selectedText || editorRef.current?.getValue();
              onSubmit(textToSubmit);
            }}
            className="border rounded-md px-3 flex items-center gap-3 text-sm font-normal"
          >
            <BiRightArrow />
            Run
          </button>
        </div>
      </div>

      <div className="pr-10 pt-3">
        <Editor
          height="300px"
          defaultLanguage="sql"
          defaultValue={val}
          onChange={onChange}
          theme="tomorrow" // Or other themes like "light", "hc-black", etc.
          options={{
            fontSize: 14,
            minimap: { enabled: false, autohide: true },
            lineNumbers: "on",
            scrollBeyondLastLine: true,
            wordWrap: "on",
            overviewRulerBorder: false,
            glyphMargin: false,
            selectionHighlight: false,
            renderLineHighlight: "none",
            cursorStyle: "line",
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
};
