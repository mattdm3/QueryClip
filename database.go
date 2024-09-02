package main

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
)

const (
	DEFAULT_QUERY_LIMIT int = 2000
)

func (a *App) AddDatabase(databaseName string, connectionString string) error {
	// Check if a connection with the same name already exists
	if _, exists := a.connections[databaseName]; exists {
		return ErrConnectionExists
	}

	// Attempt to open a database connection
	db, err := sql.Open("postgres", connectionString) // Use the appropriate driver name here
	if err != nil {
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

func (a *App) getDbConnection(dbName string) (*sql.DB, error) {
	connectionString, exists := a.connections[dbName]
	fmt.Printf("connectionString string: %s, dbName: %s", connectionString, dbName)
	if !exists {
		return nil, ErrFailedToConnect
	}
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, ErrFailedToConnect
	}
	return db, nil
}

func (a *App) getTablesForDatabase(dbName string) ([]TableInfo, error) {
	db, err := a.getDbConnection(dbName)
	if err != nil {
		return nil, err
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

func (a *App) SubmitQuery(dbName string, query string, limit int, offset int) ([]map[string]interface{}, error) {
	// Set default values if limit or offset are not provided
	if limit == 0 {
		limit = DEFAULT_QUERY_LIMIT // Default limit
	}
	if offset < 0 {
		offset = 0 // Default offset
	}

	//check db connection
	db, err := a.getDbConnection(dbName)
	if err != nil {
		return nil, err
	}

	//parse given query to check for limit
	if !hasLimitClause(query) {
		query = fmt.Sprintf("%s LIMIT %d OFFSET %d", query, limit, offset)
	}
	rows, err := db.Query(query)
	if err != nil {
		return nil, ErrFailedToQueryDatabase
	}
	defer rows.Close()

	return a.rowsToMap(rows)
}

func hasLimitClause(query string) bool {
	// Convert the query to lowercase to make the check case-insensitive
	loweredQuery := strings.ToLower(query)
	return strings.Contains(loweredQuery, "limit")
}

func (a *App) rowsToMap(rows *sql.Rows) ([]map[string]interface{}, error) {
	//get column names
	columns, err := rows.Columns()
	if err != nil {
		return nil, ErrFailedToGetColumns
	}

	// prep a slice for the results;
	results := []map[string]interface{}{}

	//interate over rows;

	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))

		for i := range columns {
			valuePtrs[i] = &values[i]
		}

		//scan result into the values pointers
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, ErrFailedToScanRow
		}

		//create a map to hold row data
		row := make(map[string]interface{})
		for i, col := range columns {
			row[col] = values[i]
		}

		// append row to the results slice
		results = append(results, row)
	}
	return results, nil
}
