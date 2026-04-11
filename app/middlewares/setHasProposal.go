package middlewares

import (
	"context"

	"github.com/gin-gonic/gin"
	backend "xeubiart.com/app/backend"
)

var hasProposalKey ContextKey = "hasProposal"

func SetHasProposal(client *backend.BackendClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		hasProposal := false

		session, err := c.Request.Cookie("v-session")
		if err == nil {
			resp, err := client.HasProposal(c.Request.Context(), session.Value)
			if err != nil {
				println(err.Error())
			}
			hasProposal = resp
		}

		ctx := context.WithValue(c.Request.Context(), hasProposalKey, hasProposal)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

func GetHasProposal(ctx context.Context) (bool, bool) {
	return getValueFromContext[bool](ctx, hasProposalKey)
}
