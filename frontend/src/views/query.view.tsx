import { useEffect, useState } from "react";
import { ViewState } from "../App";
import { GetDatabasesList } from "../../wailsjs/go/main/App";
import { DatabaseDropdown } from "../components/dropdown";
import { SqlEditor } from "../components/sql-editor";

export type ColumnInfo = {
  column_name: string;
  data_type: string;
};

export type TableInfo = {
  table_name: string;
  columns: ColumnInfo[];
};

export const QueryView = ({ selectedDbName }: { selectedDbName: string }) => {
  const [status, setStatus] = useState<string>("");
  const [val, setVal] = useState<string>("");
  const [dbList, setDbList] = useState<{
    [key: string]: Array<TableInfo>;
  }>({});

  useEffect(() => {
    GetDatabasesList(selectedDbName).then((response) => {
      setDbList(response);
    });
  }, [selectedDbName]);

  async function onChange(something: any) {
    console.log(something);
  }

  console.log({ dbList });

  return (
    <div className="my-4 flex flex-col gap-2 ">
      <span>{status}</span>
      <div className="flex  justify-end gap-2 mx-4">
        <SqlEditor onChange={onChange} val={val} />
        <div className="w-80 font-medium font-sans border rounded-t-lg  ">
          <div className="border-b font-medium rounded-t-md font-sans text-left py-3 px-4 pb-4 border-b-slate-200">
            Databases
          </div>
          <div className="text-left px-3  overflow-scroll  max-h-[30rem]">
            {Object.keys(dbList).map((dbName) => (
              <DatabaseDropdown
                key={dbName}
                dbName={dbName}
                tables={dbList[dbName]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
