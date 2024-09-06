import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { AddDatabaseView } from "./views/add-database.view";
import { DatabasesView } from "./views/databases.view";
import { QueryView } from "./views/query.view";
import { GetDatabases } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";
import { GoHome } from "react-icons/go";
import { BsDatabaseAdd } from "react-icons/bs";
import { AppContextProvider, useAppContext } from "./context";
import { VIEWS } from "./constants";

export type ViewState = {
  view: VIEWS;
  setView: (v: VIEWS) => void;
};

function App() {
  const appContext = useAppContext();

  const {
    currentView,
    setCurrentView,
    selectedDbName,
    setSelectedDbName,
    databases,
    setDatabases,
  } = appContext;

  const renderView = () => {
    switch (currentView) {
      case VIEWS.ADD_DATABASE:
        return (
          <AddDatabaseView
          // view={currentView} setView={setCurrentView}
          />
        );
      case VIEWS.VIEW_DATABASES:
        return (
          <DatabasesView
            setSelectedDbName={setSelectedDbName}
            view={currentView}
            setView={setCurrentView}
            databases={databases}
          />
        );
      case VIEWS.QUERY_VIEW:
        return <QueryView selectedDbName={selectedDbName} />;
      default:
        return (
          <AddDatabaseView
          // view={currentView} setView={setCurrentView}
          />
        );
    }
  };

  function handleUpdateView(newView: VIEWS) {
    setCurrentView(newView);
  }

  return (
    <div id="App">
      <div className="flex">
        <aside className="flex gap-3 flex-col text-sm py-4 bg-stone-100 h-screen">
          <button
            onClick={() => handleUpdateView(VIEWS.VIEW_DATABASES)}
            className={`px-3 hover:underline ${
              currentView === VIEWS.VIEW_DATABASES ? "underline" : ""
            }`}
          >
            <GoHome size={22} />
          </button>
          <button
            onClick={() => handleUpdateView(VIEWS.ADD_DATABASE)}
            className={`px-3 hover:underline ${
              currentView === VIEWS.ADD_DATABASE ? "underline" : ""
            }`}
          >
            <BsDatabaseAdd size={22} />
          </button>
        </aside>
        {renderView()}
      </div>
    </div>
  );
}

export default App;
