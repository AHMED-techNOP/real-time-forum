package handler

import (
	"net/http"

	db "real-time-forum/Database/cration"
)

func Logout(w http.ResponseWriter, r *http.Request) {
	tocken, _ := r.Cookie("SessionToken")
	_ =db.UpdateTocken(tocken.Value)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"error": "Logout successful", "status":true}`))
}
