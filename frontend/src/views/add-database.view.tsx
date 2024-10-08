import React, { useState } from "react";
import { AddDatabaseForm } from "../components/add-database-form";
import { ViewState } from "../App";
// import AddDatabaseForm from '../components/AddDatabaseForm';

export const AddDatabaseView = () => {
  const [dbConnections, setDbConnections] = useState([]);

  //   const handleAddDatabase = (newConnection) => {
  //     // Handle adding the new database connection
  //     setDbConnections([...dbConnections, newConnection]);
  //   };

  return (
    <div className="w-full">
      <div className="my-4 flex flex-col justify-center">
        <h1 className="text-2xl my-6">Add A Database</h1>
        <AddDatabaseForm />
      </div>
    </div>
  );
};
