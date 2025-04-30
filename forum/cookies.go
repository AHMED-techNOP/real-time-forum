package forum

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type cookiesReq struct {
	Token string `json:"session_token"`
}

func Cookies(w http.ResponseWriter, r *http.Request) {
	var req cookiesReq

	body, err := io.ReadAll(r.Body)
	if err != nil {
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{
			"success": false,
		})
		return
	}
	defer r.Body.Close()

	if err := json.Unmarshal(body, &req); err != nil {
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{
			"success": false,
		})
		return
	}

	var nickname string
	err = db.QueryRow("SELECT nickname FROM users WHERE session_token = ?", req.Token).Scan(&nickname)
	if err == sql.ErrNoRows {
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{"error": "Username is incorrect!"})
		return
	} else if err != nil {
		fmt.Println("1", err)
		http.Error(w, "Internal server error !", http.StatusInternalServerError)
		return
	}

	sendJSONResponse(w, http.StatusOK, map[string]any{
		"success": true,
		"path":    "/",
		"username": nickname,
	})
}
