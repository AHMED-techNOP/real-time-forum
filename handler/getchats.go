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

func Getchats(w http.ResponseWriter, r *http.Request) {
	var chat chats

	err := json.NewDecoder(r.Body).Decode(&chat)
	if err != nil {
		fmt.Println("error : ", err)
		return
	}

	// Cstr, err = db.GetlastidChat(chat.Sender, chat.Receiver)
	// 	if err != nil {
	// 		w.WriteHeader(http.StatusOK)
	// 		w.Write([]byte(`{"error": "400", "status":false, "finish": true ,"tocken":false}`))
	// 		return
	// 	}
	// fmt.Println("id:", Cstr)

	// if Cstr == 0 {
	// 	w.WriteHeader(http.StatusOK)
	// 	w.Write([]byte(`{"error": "400", "status":false, "finish": true ,"tocken":false}`))
	// 	return
	// }

	chats, err := db.SelecChats(chat.Sender, chat.Receiver, chat.Num)
	if err != nil {
		fmt.Println("error : ", err)
		return
	}

	fmt.Println(chats, len(chats))

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(chats)
}
