package template

import "html/template"


var index *template.Template
func Parsing() error {
	index = template.Must(template.ParseFiles("../presentation/template/index.html"))
	return nil
}