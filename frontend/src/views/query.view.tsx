import { useEffect, useState } from "react";
import { ViewState } from "../App";
import { GetDatabasesList, SubmitQuery } from "../../wailsjs/go/main/App";
import { DatabaseDropdown } from "../components/dropdown";
import { SqlEditor } from "../components/sql-editor";
import { QueryResultsTable } from "../components/query-results-table";

export type ColumnInfo = {
  column_name: string;
  data_type: string;
};

export type TableInfo = {
  table_name: string;
  columns: ColumnInfo[];
};

const QueryResults = ({
  queryResults,
}: {
  queryResults: Array<{ [key: string]: any }>;
}) => {
  return (
    <div className="max-w-md  border rounded-lg min-w-full py-1">
      <div className="border-b font-medium font-sans text-left py-3 px-4  border-b-slate-200">
        <div className="flex justify-between">
          <span>Results</span>
        </div>
      </div>
      <div className="overflow-scroll max-h-[20rem]">
        <QueryResultsTable data={queryResults} />
      </div>
    </div>
  );
};

export const QueryView = ({ selectedDbName }: { selectedDbName: string }) => {
  const [status, setStatus] = useState<string>("");
  const [val, setVal] = useState<string>("");
  const [dbList, setDbList] = useState<{
    [key: string]: Array<TableInfo>;
  }>({});
  const [queryResults, setQueryResults] = useState<
    Array<{ [key: string]: any }>
  >([]);

  useEffect(() => {
    GetDatabasesList(selectedDbName).then((response) => {
      setDbList(response);
    });
  }, [selectedDbName]);

  async function onChange(something: any) {
    // console.log(something);
  }

  async function onSubmit(sqlQuery: string) {
    if (!!sqlQuery) {
      try {
        SubmitQuery(selectedDbName, sqlQuery).then((response) =>
          setQueryResults(response)
        );
      } catch (error) {
        console.error({ error });
      }
    }
  }

  return (
    <div className="my-4 flex flex-col gap-2  w-full px-3">
      <span>{status}</span>
      <div className="flex w-full justify-end gap-2">
        <div className="flex flex-col gap-3 min-w-[45rem]">
          <SqlEditor onSubmit={onSubmit} onChange={onChange} val={val} />
          <QueryResults queryResults={queryResults} />
        </div>
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
