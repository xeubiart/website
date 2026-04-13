# Stage 1: Clone proto files
FROM alpine/git AS proto-stage
WORKDIR /proto-repo
# Ensure we get the latest proto definitions
RUN git clone https://github.com/xeubiart/infra .

# Stage 2: Build
# Note: If 1.25-alpine is not yet available in your registry, use 1.24-alpine
FROM golang:1.24-alpine AS builder

# 1. Install system dependencies
# protobuf-dev is critical for google/protobuf/empty.proto
RUN apk add --no-cache git ca-certificates protobuf protobuf-dev

# 2. Install Go-specific generators
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest && \
    go install github.com/a-h/templ/cmd/templ@latest

# 3. Ensure the Go bin is in the PATH so protoc can see the plugins
ENV PATH="$PATH:$(go env GOPATH)/bin"

WORKDIR /build

# 4. Handle Protobuf Generation
# Create the directory structure early
RUN mkdir -p api
COPY --from=proto-stage /proto-repo/proto/userService.proto ./api/

# Run protoc using the source_relative paths indicated by your //go:generate
# We include /usr/include so it finds the Google standard protos
RUN protoc -I. -I/usr/include \
    --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    api/userService.proto

# 5. Build the Go Application
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Run templ to generate UI components
RUN templ generate

# Build the final binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 3: Final Runtime Image
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /build/main .

# Copy frontend assets and templates
COPY --from=builder /build/atoms ./atoms
COPY --from=builder /build/components ./components
COPY --from=builder /build/templates ./templates
COPY --from=builder /build/pages ./pages
COPY --from=builder /build/static ./static

# Ensure directory for SSL certificates exists
RUN mkdir -p certs

EXPOSE 80
EXPOSE 443

CMD ["./main"]