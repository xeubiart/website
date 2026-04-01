package utils

import (
	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func Render(component templ.Component) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "text/html; charset=utf-8")
		if err := component.Render(c.Request.Context(), c.Writer); err != nil {
			c.String(500, "Render error: %v", err)
		}
	}
}
