# Stage 1: Clone proto files
FROM alpine/git AS proto-stage
WORKDIR /proto-repo

RUN git clone https://github.com/xeubiart/infra .

# Stage 2: Build
FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git ca-certificates protobuf protobuf-dev

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest && \
    go install github.com/a-h/templ/cmd/templ@latest

ENV PATH="$PATH:$(go env GOPATH)/bin"

WORKDIR /build

RUN mkdir -p proto
COPY --from=proto-stage /proto-repo/proto/userService.proto ./proto/

RUN protoc -I. -I/usr/include \
    --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    proto/userService.proto

COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Run templ to generate UI components
RUN templ generate

RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /app

COPY --from=builder /build/main .

# Copy frontend assets and templates
COPY --from=builder /build/atoms ./atoms
COPY --from=builder /build/components ./components
COPY --from=builder /build/templates ./templates
COPY --from=builder /build/pages ./pages
COPY --from=builder /build/static ./static

RUN mkdir -p certs

EXPOSE 80
EXPOSE 443

CMD ["./main"]