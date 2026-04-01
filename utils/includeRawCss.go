package utils

import (
	"html/template"
	"log"
	"os"
	"path/filepath"
	"runtime"
)

func IncludeRawCSSFile(path string) template.HTML {
	// Get the caller file
	_, callerFile, _, ok := runtime.Caller(1) // 1 = one level up the call stack
	if !ok {
		log.Println("Cannot determine caller file")
		return ""
	}

	// Build the absolute path relative to caller
	callerDir := filepath.Dir(callerFile)
	fullPath := filepath.Join(callerDir, path)

	content, err := os.ReadFile(fullPath)
	if err != nil {
		log.Printf("Error reading CSS file %s: %v", fullPath, err)
		return ""
	}

	return template.HTML("<style>" + string(content) + "</style>")
}
