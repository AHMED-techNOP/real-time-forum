package handler

import (
	"html/template"
	"net/http"
)

func First(w http.ResponseWriter, r *http.Request) {
	index := template.Must(template.ParseFiles("../presentation/template/index.html"))
	index.Execute(w, nil)
}

