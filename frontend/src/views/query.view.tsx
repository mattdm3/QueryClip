import { useCallback, useEffect, useMemo, useState } from "react";
import { ViewState } from "../App";
import {
  GetDatabasesList,
  SubmitAIQuery,
  SubmitQuery,
} from "../../wailsjs/go/main/App";
import { DatabaseDropdown } from "../components/dropdown";
import { SqlEditor } from "../components/sql-editor";
import { QueryResults } from "../components/query-results-table";
import { LLM, LLM_QUERY_INSTRUCTIONS, SQL_MODES } from "../constants";
import { useAppContext } from "../context";

export type ColumnInfo = {
  column_name: string;
  data_type: string;
};

export type TableInfo = {
  table_name: string;
  columns: ColumnInfo[];
};

const LIMIT = 2000;
const OFFSET = 0; // this will need to be mutable

export const QueryView = ({ selectedDbName }: { selectedDbName: string }) => {
  const { sqlMode, toggleSqlMode } = useAppContext();
  const isAIMode = sqlMode === SQL_MODES.AI;

  const [offset, setOffset] = useState(OFFSET);
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

  const onSubmit = (sqlQuery: string) => {
    if (!!sqlQuery) {
      try {
        if (isAIMode) {
          SubmitAIQuery(
            selectedDbName,
            sqlQuery,
            LLM_QUERY_INSTRUCTIONS,
            LLM.GPT40MINI,
            LIMIT,
            OFFSET
          ).then((response) => setQueryResults(response));
        } else {
          SubmitQuery(selectedDbName, sqlQuery, LIMIT, OFFSET).then(
            (response) => setQueryResults(response)
          );
        }
      } catch (error) {
        console.error("Client Error On submit", { error });
      }
    }
  };

  return (
    <div className="mb-4 border-t flex flex-col gap-2  w-full px-3">
      <span>{status}</span>
      <div className="flex w-full justify-end gap-2">
        <div className="flex flex-col gap-3 min-w-[45rem] w-full">
          <SqlEditor
            isAIMode={isAIMode}
            toggleSqlMode={toggleSqlMode}
            onSubmit={onSubmit}
            onChange={onChange}
            val={val}
          />
          <QueryResults queryResults={queryResults} />
        </div>
        <div className="w-80 font-medium font-sans border rounded-t-lg rounded-b-lg  ">
          <div className="border-b font-medium rounded-t-md font-sans text-left py-3 px-4 pb-4 border-b-slate-200">
            Databases
          </div>
          <div className="text-left px-3  overflow-scroll  max-h-[44rem]">
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
