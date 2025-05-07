package handler

import (
	"net/http"

	db "real-time-forum/Database/cration"
)

func Logout(w http.ResponseWriter, r *http.Request) {
	tocken, _ := r.Cookie("SessionToken")
	_ = db.UpdateTocken(tocken.Value)

	// Safely remove the WebSocket connection from the clients map
	clientsMutex.Lock()
	for conn, username := range clients {
		// Check if the username matches the one associated with the session token
		if db.GetId("sessionToken", tocken.Value) == db.GetId("username", username) {
			conn.Close() // Close the WebSocket connection
			delete(clients, conn)
			break
		}
	}
	clientsMutex.Unlock()

	// Respond with a success message
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"error": "Logout successful", "status":true}`))
}