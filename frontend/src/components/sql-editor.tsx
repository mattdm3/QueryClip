import Editor from "@monaco-editor/react";

export const SqlEditor = ({
  onChange,
  val,
}: {
  onChange: (s?: string) => void;
  val: string;
}) => {
  return (
    <div className="max-w-md min-w-[32rem] border rounded-lg py-1">
      <div className="border-b font-medium font-sans text-left py-3 px-4   border-b-slate-200">
        SQL Editor
      </div>
      <div className="pr-10 pt-3">
        <Editor
          height="400px"
          defaultLanguage="sql"
          defaultValue={val}
          onChange={onChange}
          theme="vs-light" // Or other themes like "light", "hc-black", etc.
          options={{
            fontSize: 14,
            minimap: { enabled: false, autohide: true },
            lineNumbers: "on",
            scrollBeyondLastLine: true,
            wordWrap: "on",
            overviewRulerBorder: false,
          }}
        />
      </div>
    </div>
  );
};
