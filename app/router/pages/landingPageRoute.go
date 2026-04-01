package router_pages

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	pages_landing "xeubiart.com/pages/landing"
)

func LandingPageRoute(backendURL string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "text/html; charset=utf-8")

		props := pages_landing.Props{
			Username: getUsername(backendURL, c.Request),
		}

		err := pages_landing.Index(props).Render(c.Request.Context(), c.Writer)
		if err != nil {
			c.String(http.StatusInternalServerError, "render error: %v", err)
		}
	}
}

func getUsername(backendURL string, r *http.Request) string {
	// 1. Get the SESSION from the browser's request to the Website
	sessionCookie, err := r.Cookie("SESSION")
	if err != nil {
		return ""
	}
	println(sessionCookie.Value)

	// TODO: get the backend URL from the app
	// 2. Prepare the internal request to the Spring Backend
	req, _ := http.NewRequest("GET", backendURL+"/api/private/auth/status", nil)

	// 3. Forward the exact same cookie to Spring
	req.AddCookie(sessionCookie)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 {
		return ""
	}
	defer resp.Body.Close()

	var data struct {
		Username string `json:"username"`
	}
	json.NewDecoder(resp.Body).Decode(&data)

	return data.Username
}
