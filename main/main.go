package main

import (
	"fmt"
	"net/http"
	data "real-time-forum/Database/cration"
	"real-time-forum/handler"
)

func main() {
	Db, err := data.Db()
	if err != nil {
		fmt.Println("====Z", err)
		return
	}
	
	defer Db.Close()

	router := http.NewServeMux()

	router.HandleFunc("/", handler.First)
	router.HandleFunc("/resgester", handler.Register)
	router.HandleFunc("/login", handler.Login)
	router.HandleFunc("/statuts", handler.Statuts)
	router.HandleFunc("/pubpost", handler.Post)
	router.Handle("/static/", http.HandlerFunc(handler.Sta))
	router.Handle("/javascript/", http.HandlerFunc(handler.Sta))
	router.HandleFunc("/getpost", handler.Getpost)
	router.HandleFunc("/getChats", handler.Getchats)
	router.HandleFunc("/sendcomment", handler.Sendcomment)
	router.HandleFunc("/getcomment", handler.Comments)
	router.HandleFunc("/reactione", handler.Reaction)
	router.HandleFunc("/logout", handler.Logout)
	router.HandleFunc("/categories", handler.Categore)
	// router.HandleFunc("/online-users", handler.OnlineUsers)
	router.HandleFunc("/ws", handler.WebSocketHandler) // Add WebSocket route

	go handler.HandleMessages() // Start WebSocket message handler in a goroutine

	fmt.Println("✅ Server running on: http://localhost:8080")
	err = http.ListenAndServe(":8080", router)
	if err != nil {
		fmt.Println(err)
		return
	}
}
