package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	db "real-time-forum/Database/cration"
	"real-time-forum/servisse"
	"real-time-forum/utils"
)

var (
	sr    = 0
	count = 0
)

func Categore(w http.ResponseWriter, r *http.Request) {
	var err error
	var post []utils.Postes
	_, err = servisse.IsHaveToken(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`{"error": "401", "finish": true,"status":false, "tocken":false}`))
		return
	}

	token, _ := r.Cookie("SessionToken")
	userid := db.GetId("sessionToken", token.Value)
	categories := []string{r.FormValue("categories")}
	err = servisse.CategoriesValidator(categories)
	if err != nil {
		fmt.Println("error :", categories)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "400", "status":false,"finish": true ,"tocken":false}`))
		return
	}

	lastdata := r.FormValue("lastdata")
	if lastdata == "true" {
		fmt.Println("lllllllllll")
		sr, err = db.Getlastid(categories[0])
		if err != nil {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"error": "note a categories valable","finish": true ,"status":false, "tocken":false}`))
			return
		}
	}
	if sr == -1 {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"error": "data finsh", "status":false,"finish": true ,"tocken":false}`))
		return
	}

	post, sr, err = db.GetCategories(categories[0], sr, userid)
	if err != nil {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"error": "note a categories valable", "finish": true , "status":false, "tocken":false}`))
		return
	}
	fmt.Println("==> categories len :", post)
	if len(post) < 10 {
		fmt.Println("xxxxxxxxx")
		sr = -1
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(post)
}
