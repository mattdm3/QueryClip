package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq" // Example: PostgreSQL driver (use the driver for your database)
)

// Define custom error types
var (
	ErrConnectionExists             = errors.New("a connection with this string already exists")
	ErrFailedToConnect              = errors.New("failed to connect to the database")
	ErrFailedToPing                 = errors.New("failed to verify the database connection")
	ErrFailedToLoadConnections      = errors.New("failed to read connections file")
	ErrFailedToUnmarshalConnections = errors.New("failed to unmarshal connections")
)

// App struct
type App struct {
	ctx         context.Context
	connections map[string]string
	filePath    string
}

// DatabaseConnection represents a single database connection
type DatabaseConnection struct {
	ConnectionString string `json:"dbName"`
	// Add other fields if needed, such as name, type, etc.
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

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

// NewApp creates a new App application struct
func NewApp() *App {
	// Get the directory of the running executable
	ex, err := os.Executable()
	if err != nil {
		panic(err) // handle this properly in production
	}
	exPath := filepath.Dir(ex)

	// Set the file path to the source directory
	filePath := filepath.Join(exPath, "connections.json")
	app := &App{
		connections: make(map[string]string),
		filePath:    filePath,
	}
	app.loadConnections()
	return app
}

func (a *App) AddDatabase(databaseName string, connectionString string) error {
	// Check if a connection with the same name already exists
	if _, exists := a.connections[databaseName]; exists {
		return ErrConnectionExists
	}

	// Attempt to open a database connection
	db, err := sql.Open("postgres", connectionString) // Use the appropriate driver name here
	if err != nil {
		log.Printf("Failed to open database connection for %s: %v", databaseName, err)
		return ErrFailedToConnect
	}

	// Ping the database to verify that the connection is valid
	err = db.Ping()
	if err != nil {
		log.Printf("Failed to ping database: %v", err)
		return ErrFailedToPing
	}

	// Close the database connection after verification
	defer db.Close()

	// If connection is successful, store the connection string
	a.connections[databaseName] = connectionString
	if err := a.saveConnections(); err != nil {
		log.Printf("failed to save connections to file after adding %s: %v", databaseName, err)
	}
	return nil
}

func (a *App) GetDatabases() []DatabaseConnection {
	var dbs []DatabaseConnection
	for connString := range a.connections {
		dbs = append(dbs, DatabaseConnection{ConnectionString: connString})
	}
	return dbs
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
