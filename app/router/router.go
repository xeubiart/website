package router

import (
	"net/http"
	"net/http/httputil"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"xeubiart.com/app/middlewares"
	router_pages "xeubiart.com/app/router/pages"
	"xeubiart.com/utils"

	pages_login "xeubiart.com/pages/credentials/login"
	pages_register "xeubiart.com/pages/credentials/register"
)

type Router struct {
	Router *gin.Engine
	Proxy  *httputil.ReverseProxy
}

func (r *Router) RegisterRoutes(backendURL string) {
	r.Router.Use(middlewares.ShowCookieBanner())

	r.Router.GET("/", router_pages.LandingPageRoute(backendURL))

	// Static pages
	r.Router.GET("/register", utils.Render(pages_register.Index()))
	r.Router.GET("/login", utils.Render(pages_login.Index()))

	r.Router.NoRoute(r.handleProxy)
}

func (r *Router) handleProxy(c *gin.Context) {
	path := c.Request.URL.Path

	// 1. STATIC FILE FILTER (Looking for /file/...)
	if after, ok := strings.CutPrefix(path, "/file/"); ok {
		internalPath := after

		filePath := "./" + internalPath

		if isStaticAsset(internalPath) {
			if _, err := os.Stat(filePath); err == nil {
				c.File(filePath)
				return
			}
			c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
			return
		}
	}

	// 2. BACKEND PROXY
	if strings.HasPrefix(path, "/api/public") {
		r.Proxy.ServeHTTP(c.Writer, c.Request)
		return
	}

	// 3. DEFAULT FORBIDDEN
	c.JSON(http.StatusForbidden, gin.H{
		"error":   "Forbidden",
		"message": "Access denied by Gateway.",
	})
}
func isStaticAsset(path string) bool {
	safeExtensions := []string{".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".ttf"}
	for _, ext := range safeExtensions {
		if strings.HasSuffix(strings.ToLower(path), ext) {
			return true
		}
	}
	return false
}
