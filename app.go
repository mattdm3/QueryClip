package main

import (
	"context"
	"errors"
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
	ErrFailedToQueryDatabase        = errors.New("failed to query database")
	ErrFailedToScanDatabase         = errors.New("failed to scan database")
	ErrFailedToGetTables            = errors.New("failed to fetch tables for database")
)

// App struct
type App struct {
	ctx           context.Context
	connections   map[string]string
	filePath      string
	databaseCache map[string]map[string][]TableInfo
}

// DatabaseConnection represents a single database connection
type DatabaseConnection struct {
	ConnectionString string `json:"dbName"`
	// Add other fields if needed, such as name, type, etc.
}

type ColumnInfo struct {
	ColumnName string `json:"column_name"`
	DataType   string `json:"data_type"`
}

type TableInfo struct {
	TableName string       `json:"table_name"`
	Columns   []ColumnInfo `json:"columns"`
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
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
		connections:   make(map[string]string),
		filePath:      filePath,
		databaseCache: make(map[string]map[string][]TableInfo),
	}
	app.loadConnections()
	return app
}
