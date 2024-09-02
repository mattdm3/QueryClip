import React, { useMemo } from "react";
import { useTable } from "react-table";

interface QueryResultsTableProps {
  data: Array<{ [key: string]: any }>;
}

export const QueryResultsTable = ({ data }: QueryResultsTableProps) => {
  // Use useMemo to memoize the columns and data to prevent unnecessary re-renders
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      Header: key,
      accessor: key,
    }));
  }, [data]);

  const tableData = useMemo(() => data, [data]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: tableData });

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()} className="bg-stone-100">
            {headerGroup.headers.map((column) => (
              <th
                className="font-medium text-sm py-1 text-stone-500 text-left px-4 pr-3"
                {...column.getHeaderProps()}
              >
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <td
                  {...cell.getCellProps()}
                  className="border-b border-stone-200 px-4 pr-3 py-2 text-xs text-left"
                >
                  {typeof cell.value === "boolean" ? (
                    cell.value.toString().toUpperCase() // Convert boolean to string
                  ) : cell.value !== null && cell.value !== undefined ? (
                    cell.render("Cell")
                  ) : (
                    <span className="text-stone-400">N/A</span>
                  )}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
