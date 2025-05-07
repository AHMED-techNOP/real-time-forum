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
}

var (
	Cend = 0
	Cstr = 0
)

func Getchats(w http.ResponseWriter, r *http.Request) {

	var chat chats

	err := json.NewDecoder(r.Body).Decode(&chat)
	if err != nil {
		fmt.Println("error : ", err)
		return
	}

	Cstr, err = db.GetlastidChat(chat.Sender, chat.Receiver)
		if err != nil {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"error": "400", "status":false, "finish": true ,"tocken":false}`))
			return
		}
	fmt.Println("id:", Cstr)

	if Cstr == 0 {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"error": "400", "status":false, "finish": true ,"tocken":false}`))
		return
	}

	if Cstr > 10 {
		Cend = Cstr - 10
	} else if Cstr < 10 {
		Cend = 0
	}

	chats, err := db.SelecChats(chat.Sender, chat.Receiver, Cstr, Cend)
	if err != nil {
		fmt.Println("error : ", err)
		return
	}

	if Cend-10 >= 0 {
		Cstr = Cend
		Cend -= 10
	} else {
		Cstr = Cend
		Cend = 0
	}

	fmt.Println(chats)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(chats)

}
