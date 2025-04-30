package forum

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"

	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB

func InitHandlers(database *sql.DB) {
	db = database
}

type signupReq struct {
	Nickname  string `json:"nickname"`
	Age       string `json:"age"`
	Gender    string `json:"gender"`
	FirstName string `json:"first-name"`
	LastName  string `json:"last-name"`
	Email     string `json:"email"`
	Password string `json:"password"`
}

func Singup(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{
			"success": false,
		})
		return
	}

	var req signupReq

	body, err := io.ReadAll(r.Body)
	if err != nil {
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{
			"success": false,
		})
		return
	}
	defer r.Body.Close()

	if err := json.Unmarshal(body, &req); err != nil {
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{
			"success": false,
		})
		return
	}

	fmt.Println(req)

	// hh := Hh(req)
	// if hh != "" {
	// 	sendJSONResponse(w, http.StatusUnauthorized, map[string]any{
	// 		"success": false,
	// 		"message": hh,
	// 	})
	// 	return
	// }

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{
			"success": false,
		})
		return
	}

	_, err = db.Exec("INSERT INTO users (nickname, age, gender, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?, ?, ?);", req.Nickname, req.Age, req.Gender, req.FirstName, req.LastName, req.Email, string(hashedPassword))
	if err != nil {
		fmt.Printf("%#v\n", err.Error()[26:])
		sendJSONResponse(w, http.StatusUnauthorized, map[string]any{
			"success": false,
			"message": err.Error()[26:],
		})
		return
	}

	sendJSONResponse(w, http.StatusOK, map[string]any{
		"success": true,
		"path": "log-in",
	})
}

func sendJSONResponse(w http.ResponseWriter, statusCode int, response map[string]any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

func Hh(req signupReq) string {
	if !isGmail(req.Email) {
		return "Email must be a valid Gmail address."
	}

	if !isStrongPassword(req.Password) {
		return "Password must be at least 8 characters long and include at least one number, one lowercase letter, and one uppercase letter."
	}

	return ""
}

func isGmail(email string) bool {
	gmail, _ := regexp.MatchString("^[a-zA-Z]", email)
	end, _ := regexp.MatchString("@gmail.com$", email)
	return gmail && end
}

func isStrongPassword(password string) bool {
	hasLower, _ := regexp.MatchString("[a-z]", password)
	hasUpper, _ := regexp.MatchString("[A-Z]", password)
	hasNumber, _ := regexp.MatchString("[0-9]", password)
	isLong := len(password) >= 8

	return hasLower && hasUpper && hasNumber && isLong
}
