package db

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func Db() (*sql.DB, error) {
	var err error
	DB, err = sql.Open("sqlite3", "../Database/cration/tet.db")
	if err != nil {
		return nil, err
	}
	err = CreateTable()
	if err != nil {
		return nil, err
	}

	return DB, nil
}

func GetAllUsers() ([]string, error) {
	rows, err := DB.Query("SELECT nikname FROM users ORDER BY nikname ASC;") 
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []string
	for rows.Next() {
		var nickname string
		if err := rows.Scan(&nickname); err != nil {
			return nil, err
		}
		users = append(users, nickname)
	}
	return users, nil
}
