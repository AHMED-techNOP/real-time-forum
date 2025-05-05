package handler

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins
	},
}

var clients = make(map[*websocket.Conn]string) // Map of WebSocket connections to usernames
var clientsMutex sync.RWMutex                  // Mutex to synchronize access to the clients map
var broadcast = make(chan Message)             // Channel for broadcasting messages

type Message struct {
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	Content  string `json:"content"`
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	username := r.URL.Query().Get("username")
	if username == "" {
		fmt.Println("No username provided in WebSocket connection")
		return
	}

	// Safely add the client to the map
	clientsMutex.Lock()
	clients[conn] = username
	clientsMutex.Unlock()

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("WebSocket read error:", err)

			// Safely remove the client from the map
			clientsMutex.Lock()
			delete(clients, conn)
			clientsMutex.Unlock()

			break
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
			// Send the message only to the receiver or the sender, but avoid sending it back to the sender
			if username == msg.Receiver || username == msg.Sender {
				err := client.WriteJSON(msg)
				if err != nil {
					fmt.Println("WebSocket write error:", err)

					client.Close()

					clientsMutex.Lock()
					delete(clients, client)
					clientsMutex.Unlock()
				}
			}
		}
		clientsMutex.RUnlock()
	}
}
