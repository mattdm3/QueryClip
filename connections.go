package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

// loadConnections loads the connections from the file into the app state
func (a *App) loadConnections() error {
	data, err := ioutil.ReadFile(a.filePath)
	if err != nil {
		// If the file doesn't exist, that's okay; just return
		if os.IsNotExist(err) {
			return nil
		}
		return ErrFailedToLoadConnections
	}

	err = json.Unmarshal(data, &a.connections)
	if err != nil {
		return ErrFailedToUnmarshalConnections
	}
	return nil
}

func (a *App) saveConnections() error {
	data, err := json.MarshalIndent(a.connections, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal connections: %w", err)
	}
	err = ioutil.WriteFile(a.filePath, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write connections to file: %w", err)
	}
	return nil
}

func (a *App) TestConnection(dbName string) error {
	connectionString, exists := a.connections[dbName]
	if !exists {
		return ErrFailedToConnect
	}

	//attemp to open and ping the db
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return ErrFailedToConnect
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		return ErrFailedToPing
	}

	return nil
}
