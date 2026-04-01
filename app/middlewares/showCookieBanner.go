package middlewares

import (
	"context"

	"github.com/gin-gonic/gin"
)

func ShowCookieBanner() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("xeubiart_cookie_consent")

		showBanner := (err != nil || cookie == "false")

		c.Set("showCookieBanner", showBanner)

		ctx := context.WithValue(c.Request.Context(), "showCookieBanner", showBanner)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}
