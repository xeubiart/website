package utils

import (
	"html/template"
	"log"
	"os"
	"strings"
)

func IncludeRawCSSFile(path string) template.HTML {
	cleanPath := strings.TrimPrefix(path, "/build/")

	content, err := os.ReadFile(cleanPath)
	if err != nil {
		log.Printf("Error reading CSS file %s: %v", cleanPath, err)
		return ""
	}

	return template.HTML("<style>" + string(content) + "</style>")
}

func IncludeRawJSFile(path string) template.HTML {
	cleanPath := strings.TrimPrefix(path, "/build/")

	content, err := os.ReadFile(cleanPath)
	if err != nil {
		log.Printf("Error reading CSS file %s: %v", cleanPath, err)
		return ""
	}

	return template.HTML("<script>" + string(content) + "</script>")
}
