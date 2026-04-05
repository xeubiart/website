package router_pages

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"xeubiart.com/app/middlewares"
	components_datePicker "xeubiart.com/components/date_picker"
	pages_appointment_session "xeubiart.com/pages/appointment/session"
	pages_appointment_visit "xeubiart.com/pages/appointment/visit"
)

func AppointmentPageRoute() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "text/html; charset=utf-8")

		month, _ := strconv.Atoi(c.Query("month"))
		year, _ := strconv.Atoi(c.Query("year"))

		// Return only the date-picker
		if c.GetHeader("HX-Request") == "true" {
			err := components_datePicker.DatePicker(month, year).Render(c.Request.Context(), c.Writer)
			if err != nil {
				c.String(http.StatusInternalServerError, "render error: %v", err)
			}
			return
		}

		// Return the Proposal page
		if hasProposal, _ := middlewares.GetHasProposal(c.Request.Context()); hasProposal {
			err := pages_appointment_session.AppointmentSession().Render(c.Request.Context(), c.Writer)
			if err != nil {
				c.String(http.StatusInternalServerError, "render error: %v", err)
			}
			return
		}

		// Return the appoint visit page
		err := pages_appointment_visit.AppointmentVisit().Render(c.Request.Context(), c.Writer)
		if err != nil {
			c.String(http.StatusInternalServerError, "render error: %v", err)
		}
	}
}
