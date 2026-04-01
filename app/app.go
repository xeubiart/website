package app

import (
	"crypto/tls"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/acme/autocert"
	"xeubiart.com/app/router"
)

type AppMode string

const (
	ProdMode AppMode = "prod"
	DevMode  AppMode = "dev"
)

type App struct {
	Router     *router.Router
	BackendURL string
	Mode       AppMode
}

func New(backendURL string, envMode string) *App {
	target, _ := url.Parse(backendURL)
	var mode AppMode

	mode = DevMode
	if envMode == "prod" {
		mode = ProdMode
		gin.SetMode(gin.ReleaseMode)
	}

	proxy := &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			// 1. Set the destination (Replaces the old Director logic)
			pr.SetURL(target)

			// 2. Fix the Host header so Spring doesn't reject the request
			pr.Out.Host = target.Host

			// 3. Automatically handle X-Forwarded-For, X-Forwarded-Host, and X-Forwarded-Proto
			// This is the "Modern" way - it adds the client IP for you!
			pr.SetXForwarded()
		},
	}
	router := &router.Router{
		Router: gin.Default(),
		Proxy:  proxy,
	}

	return &App{
		Router:     router,
		BackendURL: backendURL,
		Mode:       mode,
	}
}

func (app *App) Start() {
	// If we are on local dev, just use standard Gin Run
	if app.Mode == DevMode {
		app.Router.Router.Run("localhost:9999")
		return
	}

	// Otherwise, run the full Autocert logic
	app.RunSecure()
}

func (app *App) RunSecure() {
	certificateLocal := "./certs"
	if app.Mode == DevMode {
		certificateLocal = "./app/certs"
		return
	}

	// 1. Create the manager
	manager := &autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist("xeubiart.com", "www.xeubiart.com"),
		Cache:      autocert.DirCache(certificateLocal),
	}

	// 2. Configure the HTTPS server
	server := &http.Server{
		Addr:    ":443",
		Handler: app.Router.Router,
		TLSConfig: &tls.Config{
			GetCertificate: manager.GetCertificate,
			NextProtos:     []string{"h2", "http/1.1"},
		},
	}

	// 3. Start a goroutine to redirect HTTP (80) to HTTPS (443)
	go http.ListenAndServe(":80", manager.HTTPHandler(nil))

	// 4. Start HTTPS
	log.Fatal(server.ListenAndServeTLS("", ""))
}
