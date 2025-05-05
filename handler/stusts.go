package handler

import (
	"encoding/json"
	"net/http"

	"real-time-forum/servisse"
)

func Statuts(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		w.Header().Set("Content-Type", "application/json")

		name, ishave := servisse.IsHaveToken(r)

		var response map[string]any

		if ishave != nil {
			response = map[string]any{
				"error":  ishave.Error(),
				"status": false,
			}
		} else {
			response = map[string]any{
				"name":   name,
				"status": true,
			}
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}
}
