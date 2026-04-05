package middlewares

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"xeubiart.com/utils"
)

var httpClientKey ContextKey = "httpClient"
var cookieSessionKey ContextKey = "cookieSession"

func InjectHttpClient(client *utils.HttpClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Pega o contexto base
		ctx := c.Request.Context()

		// 2. Encadeia as adições no mesmo fluxo de contexto
		ctx = context.WithValue(ctx, httpClientKey, client)

		cookie, err := c.Request.Cookie("SESSION")
		if err == nil {
			ctx = context.WithValue(ctx, cookieSessionKey, cookie)
		}

		// 3. Atribui o contexto final (com ambos os valores) ao Request uma única vez
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

func GetHttpClient(ctx context.Context) (*utils.HttpClient, bool) {
	val, ok := getValueFromContext[*utils.HttpClient](ctx, httpClientKey)
	return val, ok
}

func GetCookie(ctx context.Context) (*http.Cookie, bool) {
	val, ok := getValueFromContext[*http.Cookie](ctx, cookieSessionKey)
	return val, ok
}
