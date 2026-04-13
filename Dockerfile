# Stage 1: Clone proto files
FROM alpine/git AS proto-stage
WORKDIR /proto-repo
RUN git clone https://github.com/xeubiart/infra .

# Stage 2: Build
FROM golang:1.25-alpine AS builder
RUN apk add --no-cache git ca-certificates

RUN apk add --no-cache git ca-certificates protobuf protobuf-dev

# Install protoc and gen-go dependencies
RUN apk add --no-cache protobuf
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Copy the proto file into a folder
RUN mkdir -p api
COPY --from=proto-stage /proto-repo/proto/userService.proto ./api/

# Generate the code
RUN protoc --go_out=. --go-grpc_out=. api/userService.proto

# ================================

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