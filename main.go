package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"xeubiart.com/app"
)

func main() {
	// 1. Setup Environment
	if err := godotenv.Load(".env"); err != nil {
		println("No .env file found, using system environment variables")
	}
	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		log.Fatal("BACKEND URL NOT SET")
	}

	// 2. Initialize App
	application := app.New(backendURL, os.Getenv("ENV_MODE"))

	// 3. Register Routes
	application.Router.RegisterRoutes()

	application.Start()
}
