package handler

import (
	"net/http"
	"os"
)

func Sta(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path

	_, err := os.ReadFile("../presentation" + file)
	if err != nil {

		return
	}

	http.ServeFile(w, r, "../presentation"+file)
}
