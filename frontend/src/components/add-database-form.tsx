import { useState } from "react";
import { AddDatabase } from "../../wailsjs/go/main/App";

export function AddDatabaseForm() {
  const [connectionString, setConnectionString] = useState("");
  const [databaseName, setDatabaseName] = useState("");
  const [result, setResult] = useState({ message: "", type: "" });

  async function addDatabase(databaseName: string, connectionString: string) {
    try {
      await AddDatabase(databaseName, connectionString);
      setResult({ type: "success", message: "Successfully connected!" });
    } catch (error: any) {
      setResult({ type: "error", message: error });
    }
  }

  return (
    <form className="max-w-lg mx-auto flex items-center flex-col relative">
      <span
        className={`absolute -top-4 text-sm ${
          result.type === "error" ? "text-red-600" : "text-green-500"
        }`}
      >
        {result.message}
      </span>
      <div className="mt-4">
        <input
          placeholder="Database Name"
          className="p-1 w-80 mb-2 text-black"
          onChange={(e) => setDatabaseName(e.target.value)}
        />
        <textarea
          className="w-80 h-60 text-black p-2 "
          value={connectionString}
          placeholder="Connection string"
          onChange={(e) => setConnectionString(e.target.value)}
        />
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          addDatabase(databaseName, connectionString);
        }}
      >
        Connect
      </button>
    </form>
  );
}
