package handler

import (
	"encoding/json"
	"net/http"
	db "real-time-forum/Database/cration"
)

type Users struct {
	Username string `json:"username"`
	Online   bool   `json:"online"`
}

func OnlineUsers(w http.ResponseWriter, r *http.Request) {
	allUsers, err := db.GetAllUsers()
	if err != nil {
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}

	users := []Users{}

	// Safely read from the clients map
	clientsMutex.RLock()
	for _, user := range allUsers {
		online := false
		for _, onlineUser := range clients {
			if onlineUser == user {
				online = true
				break
			}
		}
		users = append(users, Users{Username: user, Online: online})
	}
	clientsMutex.RUnlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
