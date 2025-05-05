package db

import (
	"fmt"
	"strings"

	"real-time-forum/utils"
)

func CheckInfo(info string, input string) bool { ////hna kanoxofo wax email ola wax nikname kayn 3la hsab input xno fiha wax email ola wax nikname
	var inter int
	quire := "SELECT COUNT(*) FROM users WHERE " + input + " = ?"
	err := DB.QueryRow(quire, info).Scan(&inter)
	if err != nil {
		fmt.Println(err)
		return false
	}

	return inter == 0
}

func Getpasswor(input string, typ string) (string, error) {
	var password string
	quire := "SELECT password FROM users WHERE " + input + " = ?"
	err := DB.QueryRow(quire, typ).Scan(&password)
	if err != nil {
		return "", err
	}
	return password, nil
}

func Updatesession(typ string, tocken string, input string) error {
	query := "UPDATE users SET sessionToken = $1 WHERE " + typ + " = $2"
	_, err := DB.Exec(query, tocken, input)
	if err != nil {
		return err
	}
	return nil
}

func HaveToken(tocken string) bool {
	var token int
	quire := "SELECT COUNT(*) FROM users WHERE sessionToken = ?"
	err := DB.QueryRow(quire, tocken).Scan(&token)
	if err != nil {
		return false
	}
	return token == 1
}

func GetId(input string, tocken string) int {
	var id int
	quire := "SELECT id FROM users WHERE " + input + " = ?"
	err := DB.QueryRow(quire, tocken).Scan(&id)
	if err != nil {
		return 0
	}
	return id
}

func GetUser(id int) string {
	var name string
	quire := "SELECT nikname FROM users WHERE id = ?"
	err := DB.QueryRow(quire, id).Scan(&name)
	if err != nil {
		return ""
	}
	return name
}

func GetPostes(str int, end int, userid int) ([]utils.Postes, error) {
	var postes []utils.Postes
	quire := "SELECT id, user_id, title, content, categories, created_at FROM postes WHERE id > ? AND id <= ? ORDER BY created_at DESC"
	rows, err := DB.Query(quire, end, str)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var post utils.Postes
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.Categories, &post.CreatedAt)
		if err != nil {
			return nil, err
		}
		post.Nembre, err = LenghtComent(post.ID)
		post.Username = GetUser(post.UserID)
		if post.Username == "" {
			return nil, err
		}
		sl, _ := SelecReaction(post.ID)

		post.Like, post.DisLike, post.Have = Liklength(sl, userid)
		postes = append(postes, post)
	}
	
	return postes, nil
}

var count int

func GetCategories(category string, start int, userid int) ([]utils.Postes, int, error) {
	end := 0
	var postes []utils.Postes
	quire := "SELECT post_id FROM categories WHERE category = ? AND id <= ? ORDER BY id DESC LIMIT 10"
	rows, err := DB.Query(quire, strings.ToLower(category), start)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	for rows.Next() {

		count++
		var id int
		err := rows.Scan(&id)
		if err != nil {
			return nil, 0, err
		}
		var post utils.Postes
		quire := "SELECT id, user_id, title, content, categories, created_at FROM postes WHERE id = ?"
		err = DB.QueryRow(quire, id).Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.Categories, &post.CreatedAt)
		if err != nil {
			return nil, 0, err
		}
		post.Nembre, err = LenghtComent(post.ID)
		post.Username = GetUser(post.UserID)
		if post.Username == "" {
			return nil, 0, err
		}
		sl, _ := SelecReaction(post.ID)

		post.Like, post.DisLike, post.Have = Liklength(sl, userid)
		postes = append(postes, post)
		end = id
	}

	return postes, end, nil

}

func LenghtComent(postid int) (nbr int, err error) {
	nbr = 0 // initialize the counter to 0
	quire := "SELECT COUNT(*) FROM comments WHERE post_id =?"
	err = DB.QueryRow(quire, postid).Scan(&nbr)
	if err != nil {
		return 0, err
	}
	return nbr, nil
}

func SelectComments(postid int, userid int) ([]utils.CommentPost, error) {
	var comments []utils.CommentPost
	quire := "SELECT id, post_id, user_id, comment, created_at FROM comments WHERE post_id = ? ORDER BY created_at DESC"
	rows, err := DB.Query(quire, postid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var comment utils.CommentPost
		err := rows.Scan(&comment.ID, &comment.PostID, &comment.UserID, &comment.Content, &comment.CreatedAt)
		if err != nil {
			fmt.Println("moxkil f scan")
			return nil, err
		}

		comment.Username = GetUser(comment.UserID)
		sl, _ := SelecReaction(comment.ID)
		comment.Like, comment.DisLike, comment.Have = Liklength(sl, userid)
		comments = append(comments, comment)
	}

	return comments, nil
}

func SelectPostid(postid int) error {
	query := "SELECT id FROM postes WHERE id = $1"
	_, err := DB.Exec(query, postid)
	if err != nil {
		return err
	}
	return nil
}

func Getlastid(cat string) (int, error) {
	id := 0
	query := "SELECT id FROM postes ORDER BY id DESC LIMIT 1"
	err := DB.QueryRow(query).Scan(&id)
	if cat != "" {
		query = "SELECT id FROM categories WHERE category = ? ORDER BY id DESC LIMIT 1"
		err = DB.QueryRow(query, strings.ToLower(cat)).Scan(&id)
	}

	if err != nil {
		return 0, err
	}
	return id, nil
}

func SelecReaction(Contentid int) ([]utils.Reaction, error) {
	var reactions []utils.Reaction
	quire := "SELECT id, user_id, content_type, content_id, reaction_type FROM reactions WHERE content_id = ?"
	rows, err := DB.Query(quire, Contentid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var reaction utils.Reaction
		err := rows.Scan(&reaction.ID, &reaction.User_id, &reaction.Content_type, &reaction.Content_id, &reaction.Reactione_type)
		if err != nil {
			return nil, err
		}
		reactions = append(reactions, reaction)
	}
	return reactions, nil
}

func GetReactionRow(userid int, postid int) (string, error) {
	var reaction string
	quire := "SELECT reaction_type FROM reactions WHERE user_id = ? AND content_id = ?"
	err := DB.QueryRow(quire, userid, postid).Scan(&reaction)
	if err != nil {
		return "", err
	}
	return reaction, nil
}

func Liklength(sl []utils.Reaction, userid int) (int, int, string) {
	like := 0
	dislike := 0
	reactin := ""
	for i := 0; i < len(sl); i++ {
		if sl[i].Reactione_type == "like" {
			like++
		} else if sl[i].Reactione_type == "dislike" {
			dislike++
		}
		if sl[i].User_id == userid {
			reactin = sl[i].Reactione_type
		}
	}
	return like, dislike, reactin
}
