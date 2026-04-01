package utils

import (
	"html/template"
	"log"
	"os"
)

func IncludeRawCSSFile(path string) template.HTML {
	// Just use the path directly.
	// If you pass "components/nav_bar/style.css", it looks in the current folder.
	content, err := os.ReadFile(path)
	if err != nil {
		log.Printf("Error reading CSS file %s: %v", path, err)
		return ""
	}
	return template.HTML("<style>" + string(content) + "</style>")
}
