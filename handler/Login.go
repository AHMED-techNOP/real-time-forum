package handler

import (
	"fmt"
	"net/http"
	"strings"

	db "real-time-forum/Database/cration"

	"real-time-forum/utils"
)

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		email := r.FormValue("email")
		password := r.FormValue("password")
		w.Header().Set("Content-Type", "application/json")
		var boo bool
		var err error
		typ := ""
		var hashedPassword string
		if strings.Contains(email, "@") {
			boo = db.CheckInfo(email, "email")
			typ = "email"
		} else {
			boo = db.CheckInfo(email, "nikname")
			typ = "nikname"
		}

		if !boo {
			hashedPassword, err = db.Getpasswor(typ, email)
		}

		if boo || err != nil || !utils.ComparePassAndHashedPass(hashedPassword, password) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "Invalid ` +typ+ ` or password", "status":false}`))
			return
		}
		SessionToken, erre := utils.GenerateSessionToken()
		if erre != nil {
			fmt.Println("err f sition")
			return
		}
		err = db.Updatesession(typ, SessionToken, email)////email mmkin ikon nikname mmkin ikon email
		if err != nil {
			fmt.Println("ERRORE", err)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:  "SessionToken",
			Value: SessionToken,
			Path:  "/",
		})

		
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"error": "Login successful", "status":true}`))
		// fmt.Println("Email:", email, "Password:", password)

	}
}
