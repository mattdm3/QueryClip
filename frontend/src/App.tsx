import { useEffect, useState } from "react";
import "./App.css";
import { AddDatabaseView } from "./views/add-database.view";
import { DatabasesView } from "./views/databases.view";
import { QueryView } from "./views/query.view";
import { GetDatabases } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

export enum VIEWS {
  ADD_DATABASE = "addDatabase",
  VIEW_DATABASES = "viewDatabases",
  QUERY_VIEW = "queryView",
}

export type ViewState = {
  view: VIEWS;
  setView: React.Dispatch<React.SetStateAction<VIEWS>>;
};

function App() {
  const [resultText, setResultText] = useState(
    "Please enter your name below 👇"
  );
  const [name, setName] = useState("");
  const [selectedDbName, setSelectedDbName] = useState("");
  const [databases, setDatabases] = useState<main.DatabaseConnection[]>([]);

  useEffect(() => {
    GetDatabases().then((dbs) => {
      setDatabases(dbs);
      if (dbs.length > 0) setCurrentView(VIEWS.VIEW_DATABASES);
    });
  }, []);

  const [currentView, setCurrentView] = useState<VIEWS>(VIEWS.ADD_DATABASE);

  const renderView = () => {
    switch (currentView) {
      case "addDatabase":
        return <AddDatabaseView view={currentView} setView={setCurrentView} />;
      case "viewDatabases":
        return (
          <DatabasesView
            setSelectedDbName={setSelectedDbName}
            view={currentView}
            setView={setCurrentView}
            databases={databases}
          />
        );
      case "queryView":
        return <QueryView selectedDbName={selectedDbName} />;
      default:
        return <AddDatabaseView view={currentView} setView={setCurrentView} />;
    }
  };

  function handleUpdateView(newView: VIEWS) {
    setCurrentView(newView);
  }

  return (
    <div id="App" className="my-3">
      <nav className="flex gap-3 justify-center">
        <button
          onClick={() => handleUpdateView(VIEWS.VIEW_DATABASES)}
          className={`hover:underline ${
            currentView === VIEWS.VIEW_DATABASES ? "underline" : ""
          }`}
        >
          Databases
        </button>
        <button
          onClick={() => handleUpdateView(VIEWS.ADD_DATABASE)}
          className={`hover:underline ${
            currentView === VIEWS.ADD_DATABASE ? "underline" : ""
          }`}
        >
          Add A Database
        </button>
      </nav>
      <div id="input" className="input-box">
        {/* <input
          id="name"
          className="input"
          onChange={updateName}
          autoComplete="off"
          name="input"
          type="text"
        /> */}
        {renderView()}
        {/* <button className="btn" onClick={greet}>
          Add a Database
        </button> */}
      </div>
    </div>
  );
}

export default App;
