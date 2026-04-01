FROM golang:1.25-alpine AS builder
RUN apk add --no-cache git ca-certificates

RUN go install github.com/a-h/templ/cmd/templ@latest

WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN templ generate

RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /app

# 1. Copy the binary
COPY --from=builder /build/main .

# 2. Copy your frontend asset folders specifically
COPY --from=builder /build/atoms ./atoms
COPY --from=builder /build/components ./components
COPY --from=builder /build/templates ./templates
COPY --from=builder /build/pages ./pages
COPY --from=builder /build/static ./static

RUN mkdir -p certs

EXPOSE 80
EXPOSE 443

CMD ["./main"]