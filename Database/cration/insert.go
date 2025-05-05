package db

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

func Insertuser(first_name string, last_name string, email string, gender string, age string, nikname string, password string) error {
	infiuser, err := DB.Prepare("INSERT INTO users (first_name, last_name, email, gender, age, nikname, password) VALUES (?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	age_int, err := strconv.Atoi(age)
	if err != nil {
		return err
	}
	_, err = infiuser.Exec(first_name, last_name, email, gender, age_int, nikname, password)
	if err != nil {
		return err
	}
	return nil
}

func InsertPostes(user_id int, title string, content string, catygory []string) error {
	created_at := time.Now().Format("2006-01-02 15:04:05")
	fmt.Println(created_at)
	info, err := DB.Prepare("INSERT INTO postes (user_id,title,content,created_at,categories) VALUES (?,?,?,?,?)")
	if err != nil {
		fmt.Println("==> E : ", err)
		return err
	}
	_, err = info.Exec(user_id, title, content, created_at, strings.Join(catygory, " "))
	if err != nil {
		return err
	}
	var post_id string
	err = DB.QueryRow(`SELECT id FROM postes WHERE user_id = ? AND title = ? AND content = ? AND created_at = ?`, user_id, title, content, created_at).Scan(&post_id)
	if err != nil {
		return err
	}
	id, err := strconv.Atoi(post_id)
	if err != nil {
		return err
	}
	InsertCategory(id, catygory)
	return nil
}

func InsertCategory(post_id int, catygory []string) error {
	for _, v := range catygory {
		info, err := DB.Prepare("INSERT INTO categories (post_id,category) VALUES (?,?)")
		if err != nil {
			return err
		}
		_, err = info.Exec(post_id, strings.ToLower(v))
		if err != nil {
			return err
		}
	}

	return nil
}

func InsertReaction(user_id int, content_id int, content_type string, reaction_type string) error {
	info, err := DB.Prepare("INSERT INTO reactions (user_id,content_type,content_id,reaction_type) VALUES (?,?,?,?)")
	if err != nil {
		return err
	}
	_, err = info.Exec(user_id, content_type, content_id, reaction_type)
	if err != nil {
		return err
	}
	return nil
}

func InsertComment(post_id int, user_id int, comment string) error {
	created_at := time.Now().Format("2006-01-02 15:04:05")
	info, err := DB.Prepare("INSERT INTO comments (post_id , user_id , comment , created_at) VALUES (?,?,?,?)")
	if err != nil {
		return err
	}
	_, err = info.Exec(post_id, user_id, comment, created_at)
	if err != nil {
		return err
	}
	return nil
}

func DeleteReaction(user_id int, content_id int) error {
	info, err := DB.Prepare("DELETE FROM reactions WHERE user_id = ? AND content_id = ?")
	if err != nil {
		return err
	}
	_, err = info.Exec(user_id, content_id)
	if err != nil {
		return err
	}
	return nil
}

func Update(userid int, postid int, reactiontype string) error {
	info, err := DB.Prepare("UPDATE reactions SET reaction_type = ? WHERE user_id = ? AND content_id = ?")
	if err != nil {
		return err
	}
	_, err = info.Exec(reactiontype, userid, postid)
	if err != nil {
		return err
	}
	return nil
}

func UpdateTocken(tocken string) error {
	info, err := DB.Prepare("UPDATE users SET sessionToken = NULL WHERE sessionToken = ?")
	if err != nil {
		return err
	}
	_, err = info.Exec(tocken)
	if err != nil {
		return err
	}
	return nil
}
