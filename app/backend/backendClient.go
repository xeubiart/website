package backend

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/keepalive"
	"google.golang.org/grpc/metadata"                // Necessário para o Interceptor
	"google.golang.org/protobuf/types/known/emptypb" // O tipo "Empty" oficial
	proto "xeubiart.com/proto"
)

type BackendClient struct {
	client proto.UserInfoClient
	conn   *grpc.ClientConn
}

func NewBackendClient(target string) (*BackendClient, error) {
	ka := keepalive.ClientParameters{
		Time:                10 * time.Second,
		Timeout:             5 * time.Second,
		PermitWithoutStream: true,
	}

	conn, err := grpc.NewClient(target,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithKeepaliveParams(ka),
	)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	healthClient := grpc_health_v1.NewHealthClient(conn)
	log.Printf("Connecting to gRPC backend at %s...", target)

	for {
		resp, err := healthClient.Check(ctx, &grpc_health_v1.HealthCheckRequest{Service: ""})
		if err == nil && resp.Status == grpc_health_v1.HealthCheckResponse_SERVING {
			log.Println("✅ gRPC Backend is READY and SERVING")
			break
		}
		if ctx.Err() != nil {
			return nil, ctx.Err()
		}
		time.Sleep(1 * time.Second)
	}

	return &BackendClient{
		client: proto.NewUserInfoClient(conn),
		conn:   conn,
	}, nil
}

// GetUsername agora injeta o token nos metadados
func (b *BackendClient) GetUsername(ctx context.Context, token string) (string, error) {
	// 1. Coloca o token nos Headers (Metadata) para o Interceptor do Java ler
	md := metadata.Pairs("x-session-id", token)
	ctxWithAuth := metadata.NewOutgoingContext(ctx, md)

	// 2. Chama o método passando o objeto Empty
	resp, err := b.client.GetUsername(ctxWithAuth, &emptypb.Empty{})
	if err != nil {
		log.Printf("gRPC Error: GetUsername call failed: %v", err)
		return "", err
	}
	return resp.GetUsername(), nil
}

// HasProposal segue a mesma lógica
func (b *BackendClient) HasProposal(ctx context.Context, token string) (bool, error) {
	md := metadata.Pairs("x-session-id", token)
	ctxWithAuth := metadata.NewOutgoingContext(ctx, md)

	resp, err := b.client.HasProposal(ctxWithAuth, &emptypb.Empty{})
	if err != nil {
		log.Printf("gRPC Error: HasProposal call failed: %v", err)
		return false, err
	}
	return resp.GetHasProposal(), nil
}

func (b *BackendClient) Close() {
	b.conn.Close()
}
