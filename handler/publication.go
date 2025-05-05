package handler

import (
	"fmt"
	"net/http"

	db "real-time-forum/Database/cration"
	"real-time-forum/servisse"
)

func Post(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		_, ishave := servisse.IsHaveToken(r)
		if ishave != nil {
			fmt.Println("token not found POST")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "401", "status":false , "tocken":false}`))
			return
		}
		title := r.FormValue("title")
		content := r.FormValue("content")
		categories := r.Form["categories"]
		if len(categories) == 0 || title == "" || content == "" {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "400", "status":false ,"tocken":true}`))
			return
		}
		err := servisse.CategoriesValidator(categories)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "400", "status":false ,"tocken":true}`))
			return
		}
		tocken, _ := r.Cookie("SessionToken")
		user_id := db.GetId("sessionToken", tocken.Value)
		errore := db.InsertPostes(user_id, title, content, categories)

		if errore != nil {
			fmt.Println("===> er : ", errore)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"error": "500", "status":false ,"tocken":true}`))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"error": "200", "status":true ,"tocken":true}`))

	}
}
