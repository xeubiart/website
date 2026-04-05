package middlewares

import (
	"context"
	"encoding/json"

	"github.com/gin-gonic/gin"
	"xeubiart.com/utils"
)

var usernameKey ContextKey = "username"

// Adds the name to context so it can be read when needed
func SetUsername(client *utils.HttpClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := ""

		session, err := c.Request.Cookie("SESSION")
		if err == nil {
			resp, err := client.Do("GET", "/api/private/account/me", session, nil)
			if err == nil {
				defer resp.Body.Close()

				var data struct {
					Username string `json:"name"`
				}

				if err := json.NewDecoder(resp.Body).Decode(&data); err == nil {
					username = data.Username
				}
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
