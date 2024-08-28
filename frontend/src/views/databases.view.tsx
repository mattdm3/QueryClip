import { useEffect, useState } from "react";
import { VIEWS, ViewState } from "../App";
import { GetDatabases, TestConnection } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

export const DatabasesView = ({
  view,
  setView,
  setSelectedDbName,
  databases,
}: ViewState & {
  databases: main.DatabaseConnection[];
  setSelectedDbName: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [status, setStatus] = useState<string>("");

  async function connectToDb(dbName: string) {
    try {
      console.log("Attempting to connect to ", dbName);
      await TestConnection(dbName);
      setSelectedDbName(dbName);
      setView(VIEWS.QUERY_VIEW);
    } catch (error) {
      console.log({ error });
      setStatus(error as string);
    }
  }

  return (
    <div className="my-4 flex flex-col gap-3 mx-auto  justify-center">
      <span>{status}</span>
      {databases.map((db) => (
        <button
          onClick={() => connectToDb(db.dbName)}
          className="border w-80 mx-auto py-1 rounded-md border-gray-400"
        >
          {db.dbName}
        </button>
      ))}
    </div>
  );
};
