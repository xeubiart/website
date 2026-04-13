package app

import (
	"log"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
	backendClient "xeubiart.com/app/backend"
	"xeubiart.com/app/router"
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

func New(backendURL, backendGRPCURL string, envMode string) *App {
	var mode AppMode = DevMode
	if envMode == "prod" {
		mode = ProdMode
		gin.SetMode(gin.ReleaseMode)
	}

	proxyTarget := backendURL
	if !strings.HasPrefix(proxyTarget, "http") {
		proxyTarget = "http://" + proxyTarget
	}
	target, _ := url.Parse(proxyTarget)

	proxy := &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			pr.SetURL(target)
			pr.Out.Host = target.Host
			pr.SetXForwarded()
		},
	}

	bClient, err := backendClient.NewBackendClient(backendGRPCURL)
	if err != nil {
		log.Fatalf("Fatal: Could not connect to gRPC backend: %v", err)
	}

	r := &router.Router{
		Router:        gin.Default(),
		BackendClient: bClient,
		Proxy:         proxy,
	}

	return &App{
		Router: r,
		Mode:   mode,
	}
}

func (app *App) Start() {
	port := ":9999"
	if app.Mode == ProdMode {
		port = ":8081"
	}

	log.Printf("Starting Xeubiart Frontend in %s mode on %s", app.Mode, port)
	log.Fatal(app.Router.Router.Run(port))
}
