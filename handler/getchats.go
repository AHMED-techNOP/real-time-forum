package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	db "real-time-forum/Database/cration"
)

type chats struct {
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	Num      int `json:"num"`
}

var chatCount = 0

func Getchats(w http.ResponseWriter, r *http.Request) {
	var chat chats

	err := json.NewDecoder(r.Body).Decode(&chat)
	if err != nil {
		fmt.Println("error : ", err)
		return
	}

	if chat.Num == 0 {
		chatCount = 0
	}

	chats, err := db.SelecChats(chat.Sender, chat.Receiver, chatCount)
	if err != nil {
		fmt.Println("error : ", err)
		return
	}

	// fmt.Println(chats, len(chats), "chatcount : ", chatCount)
	
	chatCount += 10


	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(chats)
}
