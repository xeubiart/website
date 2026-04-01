package utils

import (
	"html/template"
	"log"
	"os"
)

func IncludeRawCSSFile(path string) template.HTML {
	content, err := os.ReadFile(path)
	if err != nil {
		log.Printf("Error reading CSS file %s: %v", path, err)
		return ""
	}

	return template.HTML("<style>" + string(content) + "</style>")
}
