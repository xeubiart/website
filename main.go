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
	backendGRPCURL := os.Getenv("BACKEND_GRPC_URL")
	if backendURL == "" {
		log.Fatal("BACKEND GRPC URL NOT SET")
	}

	println(backendURL)

	// 2. Initialize App
	application := app.New(backendURL, backendGRPCURL, os.Getenv("ENV_MODE"))

	// 3. Register Routes
	application.Router.RegisterRoutes()

	application.Start()
}
