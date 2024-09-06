import Editor, { Monaco } from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiRightArrow } from "react-icons/bi";
import { useAppContext } from "../context";
import { RxMagicWand } from "react-icons/rx";
import { SQL_MODES } from "../constants";

export const SqlEditor = ({
  onChange,
  val,
  onSubmit,
  toggleSqlMode,
  isAIMode,
}: {
  onChange: (s?: string) => void;
  val: string;
  onSubmit: (s: string) => void;
  toggleSqlMode: () => void;
  isAIMode: boolean;
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Register the command for Cmd + Enter
    editor?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
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
          <div className="flex items-center gap-4">
            <span className={`${isAIMode ? "text-purple-500" : "text-black"}`}>
              {isAIMode ? "AI Text-2-SQL" : "SQL Editor"}
            </span>
            <button onClick={toggleSqlMode}>
              <RxMagicWand color={isAIMode ? "#a855f7" : "black"} size={18} />
            </button>
          </div>
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
          key={isAIMode ? "ai-mode" : "sql-mode"}
          height="300px"
          defaultLanguage={"sql"}
          defaultValue={undefined}
          onChange={onChange}
          // language={isAIMode ? "markdown" : "sql"}
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
