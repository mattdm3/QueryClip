import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SQL_MODES, VIEWS } from "./constants";
import { main } from "../wailsjs/go/models";
import { GetDatabases } from "../wailsjs/go/main/App";

interface AppContextType {
  currentView: string;
  selectedDbName: string;
  databases: main.DatabaseConnection[];
  setDatabases: (database: main.DatabaseConnection[]) => void;
  setCurrentView: (view: VIEWS) => void;
  setSelectedDbName: (dbName: string) => void;
  sqlMode: SQL_MODES;
  setSqlMode: (s: SQL_MODES) => void;
  toggleSqlMode: () => void;
}

const INITIAL_CONTEXT: AppContextType = {
  currentView: VIEWS.VIEW_DATABASES,
  selectedDbName: "",
  databases: [],
  setCurrentView: () => {},
  setSelectedDbName: () => {},
  setDatabases: () => {},
  sqlMode: SQL_MODES.SQL,
  setSqlMode: () => {},
  toggleSqlMode: () => {},
};

const AppContext = createContext(INITIAL_CONTEXT);

export function AppContextProvider({ children }: any) {
  const [currentView, setCurrentView] = useState<VIEWS>(VIEWS.VIEW_DATABASES);
  const [sqlMode, setSqlMode] = useState<SQL_MODES>(SQL_MODES.SQL);
  const [selectedDbName, setSelectedDbName] = useState("");
  const [databases, setDatabases] = useState<main.DatabaseConnection[]>([]);

  const toggleSqlMode = useCallback(
    () =>
      setSqlMode((curr) =>
        curr === SQL_MODES.SQL ? SQL_MODES.AI : SQL_MODES.SQL
      ),
    []
  );

  useEffect(() => {
    GetDatabases().then((dbs) => {
      setDatabases(dbs);
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        selectedDbName,
        databases,
        setCurrentView,
        setSelectedDbName,
        setDatabases,
        sqlMode,
        setSqlMode,
        toggleSqlMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
