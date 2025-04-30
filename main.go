package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"text/template"

	"forum/forum"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func init() {
	var err error
	db, err = sql.Open("sqlite3", "./databases/data.db")
	if err != nil {
		log.Fatal(err)
	}

	sqlStatements, err := os.ReadFile("./databases/my.sql")
	if err != nil {
		log.Fatal("Error reading SQL file:", err)
	}
	_, err = db.Exec(string(sqlStatements))
	if err != nil {
		log.Fatal("Error executing SQL statements:", err)
	}

	forum.InitHandlers(db)
}

func main() {

	http.HandleFunc("/", Root)
	http.HandleFunc("/static/", StaticHandle)

	http.HandleFunc("/signup", forum.Singup)
	http.HandleFunc("/login", forum.Login)
	http.HandleFunc("/cookies", forum.Cookies)


	fmt.Println("http://localhost:8080")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func Root(w http.ResponseWriter, r *http.Request) {
	tmp, err := template.ParseFiles("index.html")
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	tmp.Execute(w, nil)
}

func StaticHandle(w http.ResponseWriter, r *http.Request) {
	fs := http.StripPrefix("/static/", http.FileServer(http.Dir("static")))
	_, err := os.Stat("." + r.URL.Path)
	if strings.HasSuffix(r.URL.Path, "/") || err != nil {
		http.Error(w, "static", http.StatusForbidden)
		return
	}
	fs.ServeHTTP(w, r)
}
