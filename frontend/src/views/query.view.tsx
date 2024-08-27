import { useEffect, useState } from "react";
import { ViewState } from "../App";
import { GetDatabases, TestConnection } from "../../wailsjs/go/main/App";
import Editor from "@monaco-editor/react";

export const QueryView = ({ view, setView }: ViewState) => {
  const [status, setStatus] = useState<string>("");
  const [val, setVal] = useState<string>("");

  async function connectToDb(dbName: string) {
    try {
      console.log("Attempting to connect to ", dbName);
      await TestConnection(dbName);
    } catch (error) {
      setStatus(error as string);
    }
  }
  async function onChange(something: any) {
    console.log(something);
  }

  return (
    <div className="my-4 flex flex-col gap-3 mx-auto  justify-center">
      <span>{status}</span>
      <div className="max-w-md mx-auto min-w-[30rem]">
        <div className="bg-white text-black font-medium font-sans text-left py-3 px-4 rounded-t-md border border-b-slate-400">
          SQL Editor
        </div>
        <Editor
          height="400px"
          defaultLanguage="sql"
          defaultValue={val}
          onChange={onChange}
          theme="vs-light" // Or other themes like "light", "hc-black", etc.
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: true,
          }}
        />
      </div>
    </div>
  );
};
