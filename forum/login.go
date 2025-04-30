package forum

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type loginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "method not allowd", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Bad Request ", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req loginReq
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Bad Request ", http.StatusBadRequest)
		return
	}

	var userID int
	var hashedPassword string
	err = db.QueryRow("SELECT id, password FROM users WHERE nickname = ?", req.Username).Scan(&userID, &hashedPassword)
	if err == sql.ErrNoRows {
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{"error": "Username is incorrect!"})
		return
	} else if err != nil {
		fmt.Println("1",err)
		http.Error(w, "Internal server error !", http.StatusInternalServerError)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{"error": "Password is incorrect!"})
		return
	}

	sessionToken := uuid.New().String()
	expiration := time.Now().Add(1 * time.Hour)

	_, err = db.Exec("UPDATE users SET session_token = ? WHERE id = ?", sessionToken, userID)
	if err != nil {
		fmt.Println("2",err)
		http.Error(w, "Internal server error !", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Expires:  expiration,
		Path:     "/",
	})



	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"path":    "/",
	})
}
