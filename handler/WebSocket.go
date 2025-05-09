package handler

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	db "real-time-forum/Database/cration"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins
	},
}

var (
	clients      = make(map[*websocket.Conn]string) // Map of WebSocket connections to usernames
	clientsMutex sync.RWMutex                       // Mutex to synchronize access to the clients map
	broadcast    = make(chan Message)               // Channel for broadcasting messages
)

type Message struct {
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	Content  string `json:"content"`
	Time     string
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade error:", err)
		return
	}
	defer func() {
		// Safely remove the client from the map when the connection is closed
		clientsMutex.Lock()
		delete(clients, conn)
		clientsMutex.Unlock()

		// Broadcast the updated list of online users
		BroadcastOnlineUsers()
		conn.Close()
	}()

	username := r.URL.Query().Get("username")
	if username == "" {
		fmt.Println("No username provided in WebSocket connection")
		return
	}

	// Safely add the client to the map
	clientsMutex.Lock()
	for existingConn, existingUsername := range clients {
		if existingUsername == username {
			// Close the previous connection for the same username
			fmt.Println("Closing previous connection for username:", username)
			existingConn.Close()
			delete(clients, existingConn)
			break
		}
	}
	clients[conn] = username
	clientsMutex.Unlock()

	// Broadcast the updated list of online users
	BroadcastOnlineUsers()

	for {

		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("WebSocket read error:", err)
			break
		}

		time := time.Now().Format("2006-01-02 15:04:05")
		msg.Time = time

		err = db.InsertMessages(msg.Sender, msg.Receiver, msg.Content, msg.Time)
		if err != nil {
			fmt.Println("insert massages error:", err)
			return
		}

		broadcast <- msg
	}
}

func HandleMessages() {
	for {
		msg := <-broadcast

		// Safely iterate over the clients map
		clientsMutex.RLock()
		for client, username := range clients {
			// Send the message to both the sender and the receiver
			if username == msg.Receiver || username == msg.Sender {
				err := client.WriteJSON(msg)
				if err != nil {
					fmt.Println("WebSocket write error:", err)

					client.Close()

					// Safely remove the client from the map
					clientsMutex.Lock()
					delete(clients, client)
					clientsMutex.Unlock()
				}
			}
		}
		clientsMutex.RUnlock()
	}
}

func BroadcastOnlineUsers() {
	clientsMutex.RLock()
	defer clientsMutex.RUnlock()

	// Fetch all users from the database
	allUsers, err := db.GetAllUsers()
	if err != nil {
		fmt.Println("Error fetching all users:", err)
		return
	}
	fmt.Println("==> all users :", allUsers)

	// Build the list of users with their online status
	users := []map[string]interface{}{}
	for _, user := range allUsers {
		online := false
		for _, onlineUser := range clients {
			if onlineUser == user {
				online = true
				break
			}
		}
		users = append(users, map[string]interface{}{
			"username": user,
			"online":   online,
		})
	}

	// Broadcast the list of users with their online status
	message := map[string]interface{}{
		"type":  "online-users",
		"users": users,
	}
	fmt.Println("==> online users :", message)
	for client := range clients {
		err := client.WriteJSON(message)
		if err != nil {
			fmt.Println("WebSocket write error:", err)
			client.Close()
			clientsMutex.Lock()
			delete(clients, client)
			clientsMutex.Unlock()
		}
	}
}
