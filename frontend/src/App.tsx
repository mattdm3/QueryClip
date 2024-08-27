import { useState } from "react";
import logo from "./assets/images/logo-universal.png";
import "./App.css";
import { AddDatabaseView } from "./views/add-database.view";
import { DatabasesView } from "./views/databases.view";
import { QueryView } from "./views/query.view";

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
  const updateName = (e: any) => setName(e.target.value);
  const updateResultText = (result: string) => setResultText(result);

  const [currentView, setCurrentView] = useState<VIEWS>(VIEWS.ADD_DATABASE);

  const renderView = () => {
    switch (currentView) {
      case "addDatabase":
        return <AddDatabaseView view={currentView} setView={setCurrentView} />;
      case "viewDatabases":
        return <DatabasesView view={currentView} setView={setCurrentView} />;
      case "queryView":
        return <QueryView view={currentView} setView={setCurrentView} />;
      default:
        return <AddDatabaseView view={currentView} setView={setCurrentView} />;
    }
  };

  function handleUpdateView(newView: VIEWS) {
    setCurrentView(newView);
  }

  return (
    <div id="App" className="my-3">
      {/* <img src={logo} id="logo" alt="logo" />
      <div id="result" className="result">
        {resultText}
      </div> */}
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
