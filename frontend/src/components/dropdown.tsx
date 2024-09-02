import { useState } from "react";
import { RxCaretDown } from "react-icons/rx";
import { TableInfo } from "../views/query.view";

export const TableDropdown = ({ table }: { table: TableInfo }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  console.log({ table: table.columns });

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex font-sans font-normal text-sm items-center w-full py-0 text-gray-700 bg-transparent hover:text-gray-900 focus:outline-none"
      >
        <RxCaretDown
          className={`mr-2 transform ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
        {table.table_name}
      </button>
      {isOpen && (
        <ul className="mt-1 pl-4 space-y-2">
          {table.columns.map((column) => (
            <li
              key={column.column_name}
              className="px-3 py-0 text-gray-700 font-normal text-xs hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex justify-between">
                <p>{column.column_name}</p>
                <p className="font-light font-mono text-xs text-blue-500">
                  {/* get the first word */}
                  {column.data_type.split(" ")[0]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const DatabaseDropdown = ({
  dbName,
  tables,
}: {
  dbName: string;
  tables: TableInfo[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  console.log({ tables });
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center  w-full py-2 text-lg font-medium text-gray-700 bg-transparent hover:text-gray-900 focus:outline-none"
      >
        <RxCaretDown
          className={`mr-2 transform ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
        {dbName}
      </button>
      {isOpen && (
        <ul className="mt-0 pl-2 space-y-2">
          {tables.map((table, index) => (
            <TableDropdown key={index} table={table} />
          ))}
        </ul>
      )}
    </div>
  );
};
