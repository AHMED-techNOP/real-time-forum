package db

func CreateTable() error {
	// Code to create a table
	tables := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		first_name TEXT NOT NULL,
		last_name TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		gender TEXT NOT NULL,
		age INTEGER NOT NULL,
		nikname TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		sessionToken TEXT
	);
	
	CREATE TABLE IF NOT EXISTS postes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		categories TEXT NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS categories (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		post_id INTEGER NOT NULL,
		category TEXT NOT NULL,
		FOREIGN KEY (post_id) REFERENCES postes(id) ON DELETE CASCADE
	);
	CREATE TABLE IF NOT EXISTS comments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		post_id INTEGER NOT NULL,
		user_id INTEGER NOT NULL,
		comment TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (post_id) REFERENCES postes(id) ON DELETE CASCADE,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);
	CREATE TABLE IF NOT EXISTS reactions (
   		 id INTEGER PRIMARY KEY AUTOINCREMENT,
    	 user_id INTEGER NOT NULL,
    	 content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment')) ,
     	 content_id INTEGER NOT NULL, 
    	 reaction_type TEXT NOT NULL ,
    	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		
);
`

	_, err := DB.Exec(tables)
	if err != nil {
		return err
	}
	return nil
}
