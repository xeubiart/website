package utils

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type HttpClient struct {
	BaseURL string
	Client  *http.Client
}

func NewHttpClient(baseURL string) *HttpClient {
	return &HttpClient{
		BaseURL: baseURL,
		Client:  &http.Client{},
	}
}

func (h *HttpClient) Do(method, path string, session *http.Cookie, body interface{}) (*http.Response, error) {
	var bodyReader io.Reader

	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, h.BaseURL+path, bodyReader)
	if err != nil {
		return nil, err
	}

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	if session != nil {
		req.AddCookie(session)
	}

	return h.Client.Do(req)
}
