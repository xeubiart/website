package middlewares

import (
	"context"

	"github.com/gin-gonic/gin"
	backend "xeubiart.com/app/backend"
)

var usernameKey ContextKey = "username"

// Adds the name to context so it can be read when needed
func SetUsername(client *backend.BackendClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := ""

		session, err := c.Request.Cookie("v-session")
		if err == nil {
			username, err = client.GetUsername(c.Request.Context(), session.Value)
			if err != nil {
				println("gRPC Error:", err.Error())
			}
		}

		ctx := context.WithValue(c.Request.Context(), usernameKey, username)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

func GetUsername(ctx context.Context) (string, bool) {
	return getValueFromContext[string](ctx, usernameKey)
}
