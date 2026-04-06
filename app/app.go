package app

import (
	"log"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
	"xeubiart.com/app/router"
	"xeubiart.com/utils"
)

type AppMode string

const (
	ProdMode AppMode = "prod"
	DevMode  AppMode = "dev"
)

type App struct {
	Router *router.Router
	Mode   AppMode
}

func New(backendURL string, envMode string) *App {
	target, _ := url.Parse(backendURL)
	var mode AppMode = DevMode

	if envMode == "prod" {
		mode = ProdMode
		gin.SetMode(gin.ReleaseMode)
	}

	proxy := &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			// 1. Set the destination URL
			pr.SetURL(target)

			// 2. Fix the Host header for the outgoing request
			// This ensures the Spring backend sees the correct target host
			pr.Out.Host = target.Host

			// 3. Forward client info (IP, Proto, etc.)
			// Since Caddy is sitting in front of THIS Go app,
			// this will pass along the info Caddy sent.
			pr.SetXForwarded()
		},
	}

	r := &router.Router{
		Router: gin.Default(),
		Proxy:  proxy,
		Client: utils.NewHttpClient(backendURL),
	}

	return &App{
		Router: r,
		Mode:   mode,
	}
}

func (app *App) Start() {
	port := ":9999"

	// In Docker/Prod, we usually listen on all interfaces (0.0.0.0)
	if app.Mode == ProdMode {
		port = ":80"
	}

	log.Printf("Starting Xeubiart Frontend in %s mode on %s", app.Mode, port)

	// We no longer need RunSecure(). Caddy handles the TLS.
	log.Fatal(app.Router.Router.Run(port))
}
