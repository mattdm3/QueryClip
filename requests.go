package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/go-resty/resty/v2"
	"github.com/joho/godotenv"
)

// OpenAiMessage defines the structure for a message
type OpenAiMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// OpenAiRequest defines the structure for the OpenAI API request
type OpenAiRequest struct {
	Model       string          `json:"model"`
	Messages    []OpenAiMessage `json:"messages"`
	Temperature float32         `json:"temperature"`
}

// OpenAiResponseChoice defines the structure of each choice in the OpenAI API response
type OpenAiResponseChoice struct {
	Message OpenAiMessage `json:"message"`
}

// OpenAiResponse defines the structure of the OpenAI API response
type OpenAiResponse struct {
	Choices []OpenAiResponseChoice `json:"choices"`
}

// LLAMA

type LlamaMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type LlamaRequest struct {
	Model    string         `json:"model"`
	Messages []LlamaMessage `json:"messages"`
	Stream   bool           `json:"stream"`
}

type LlamaContent struct {
	Content string `json:"content"`
}

type LlamaResponse struct {
	Message LlamaContent `json:"message"`
}

// LoadEnv loads environment variables from a .env file and returns the value for a given key
func LoadEnv(key string) (string, bool) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	value, exists := os.LookupEnv(key)
	if !exists {
		log.Fatalf("Environment variable %s not set", key)
	}
	return value, exists
}

func callOpenAI(prompt string, instructions string, llmModel string) (string, error) {
	apiKey, _ := LoadEnv("OPEN_API_KEY")
	apiURL := "https://api.openai.com/v1/chat/completions"

	client := resty.New()
	client.SetDebug(true)

	//prepare messages:
	messages := []OpenAiMessage{
		{
			Role:    "user",
			Content: prompt,
		},
	}

	if instructions != "" {
		messages = append([]OpenAiMessage{
			{
				Role:    "system",
				Content: instructions,
			},
		}, messages...)
	}
	// prepare body
	requestBody := OpenAiRequest{
		Model:       llmModel,
		Messages:    messages,
		Temperature: 0.2,
	}

	// Prepare a variable to hold the response
	var result OpenAiResponse

	//make request
	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetHeader("Authorization", fmt.Sprintf("Bearer %s", apiKey)).
		SetBody(requestBody).
		SetResult(&result).
		Post(apiURL)

	if err != nil {
		return "", fmt.Errorf("failed to make request: %w", err)
	}

	if resp.StatusCode() != 200 {
		return "", fmt.Errorf("non-200 response: %s", resp.Status())
	}

	// Extract and unescape the generated text from the response
	if len(result.Choices) > 0 {
		content := result.Choices[0].Message.Content
		// Unescape the content if it contains escaped quotes
		if strings.HasPrefix(content, "\"") && strings.HasSuffix(content, "\"") {
			var unescapedContent string
			if err := json.Unmarshal([]byte(content), &unescapedContent); err != nil {
				return "", fmt.Errorf("failed to unescape content: %w", err)
			}
			return unescapedContent, nil
		}
		return content, nil
	}

	return "", fmt.Errorf("no choices in the response")
}

func callLlamaClient(prompt string, instructions string, llmModel string) (string, error) {
	// This will require setting up llama 3. You can download it here: https://ollama.com/download
	apiURL := "http://127.0.0.1:11434/api/chat"

	client := resty.New()
	client.SetDebug(true)

	//prepare messages:
	messages := []LlamaMessage{
		{
			Role:    "user",
			Content: prompt,
		},
	}

	if instructions != "" {
		messages = append([]LlamaMessage{
			{
				Role:    "system",
				Content: instructions,
			},
		}, messages...)
	}

	if llmModel == "" {
		llmModel = "llama3"
	}
	// prepare body
	requestBody := LlamaRequest{
		Model:    llmModel,
		Messages: messages,
	}

	// Prepare a variable to hold the response
	var result LlamaResponse

	//make request
	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(requestBody).
		SetResult(&result).
		Post(apiURL)

	if err != nil {
		return "", fmt.Errorf("failed to make request: %w", err)
	}

	if resp.StatusCode() != 200 {
		return "", fmt.Errorf("non-200 response: %s", resp.Status())
	}

	// Extract the generated text from the response
	return result.Message.Content, nil

}
