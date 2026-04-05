package middlewares

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"xeubiart.com/utils"
)

var hasProposalKey ContextKey = "hasProposal"

func SetHasProposal(client *utils.HttpClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		hasProposal := false

		session, err := c.Request.Cookie("SESSION")
		if err == nil {
			resp, err := client.Do("GET", "/api/private/proposal/status", session, nil)
			if err == nil {
				defer resp.Body.Close()
				hasProposal = resp.StatusCode == http.StatusOK
			}
		}

		ctx := context.WithValue(c.Request.Context(), hasProposalKey, hasProposal)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

func GetHasProposal(ctx context.Context) (bool, bool) {
	return getValueFromContext[bool](ctx, hasProposalKey)
}
