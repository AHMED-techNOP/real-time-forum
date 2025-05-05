package servisse

import (
	"errors"
	"net/http"

	db "real-time-forum/Database/cration"
)

func IsHaveToken(r *http.Request) (string, error) {
	sesiontoken, err := r.Cookie("SessionToken")
	if err != nil || sesiontoken.Value == "" || !db.HaveToken(sesiontoken.Value) {
		return "", errors.New("Unauthorized")
	}
	id := db.GetId("sessionToken", sesiontoken.Value)
	name := db.GetUser(id)
	return name, nil
}
