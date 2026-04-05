package middlewares

import (
	"context"
	"log"
)

type ContextKey string

func getValueFromContext[T any](ctx context.Context, key ContextKey) (T, bool) {
	value := ctx.Value(key)
	if value == nil {
		log.Println("\033[31m[ERROR] Can't find", key, "in context (missing middleware?)\033[0m")

		var zero T
		return zero, false
	}

	if result, ok := value.(T); ok {
		return result, true
	}

	log.Println("\033[31m[ERROR] Type assertion failed for key:", key, "\033[0m")
	var zero T
	return zero, false
}
