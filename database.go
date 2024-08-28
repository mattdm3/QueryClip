package main

import (
	"database/sql"
	"fmt"
	"log"
)

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

func (a *App) GetDatabasesList(dbName string) (map[string][]TableInfo, error) {

	// Check if the result is already in the cache
	if cachedResult, found := a.databaseCache[dbName]; found {
		return cachedResult, nil
	}

	connectionString, exists := a.connections[dbName]

	if !exists {
		return nil, ErrFailedToConnect
	}

	//attemp to open and ping the db
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, ErrFailedToConnect
	}
	defer db.Close()

	rows, err := db.Query("SELECT datname from pg_database where datistemplate = false;")

	if err != nil {
		return nil, ErrFailedToQueryDatabase
	}

	defer rows.Close()

	databases := make(map[string][]TableInfo)
	for rows.Next() {
		var db string
		if err := rows.Scan(&db); err != nil {
			return nil, ErrFailedToScanDatabase
		}
		// for each db get list of tables and their colums
		tables, err := a.getTablesForDatabase(dbName)
		if err != nil {
			return nil, ErrFailedToGetTables
		}
		// Store the database name and its tables in the map
		databases[db] = tables
	}

	// Store the result in the cache before returning
	a.databaseCache[dbName] = databases

	return databases, nil
}

func (a *App) getTablesForDatabase(dbName string) ([]TableInfo, error) {
	connectionString, exists := a.connections[dbName]
	fmt.Printf("connectionString string: %s, dbName: %s", connectionString, dbName)
	if !exists {
		return nil, ErrFailedToConnect
	}
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, ErrFailedToConnect
	}
	defer db.Close()

	rows, err := db.Query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
	if err != nil {
		return nil, ErrFailedToQueryDatabase
	}
	defer rows.Close()

	var tables []TableInfo
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			return nil, ErrFailedToScanDatabase
		}
		// get columns for this table
		columns, err := a.getColumnsForTable(db, tableName)
		if err != nil {
			return nil, fmt.Errorf("failed to get columns for table %s: %w", tableName, err)
		}
		tables = append(tables, TableInfo{
			TableName: tableName,
			Columns:   columns,
		})
	}
	return tables, nil
}

func (a *App) getColumnsForTable(db *sql.DB, tableName string) ([]ColumnInfo, error) {
	rows, err := db.Query(`
		SELECT column_name, data_type
		FROM information_schema.columns
		WHERE table_name = $1`, tableName)

	if err != nil {
		return nil, ErrFailedToQueryDatabase
	}
	defer rows.Close()

	var columns []ColumnInfo
	for rows.Next() {
		var column ColumnInfo
		if err := rows.Scan(&column.ColumnName, &column.DataType); err != nil {
			return nil, ErrFailedToScanDatabase
		}
		columns = append(columns, column)
	}
	return columns, nil
}
