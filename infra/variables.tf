variable "project_id" {
  description = "The GCP project ID to deploy to."
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources in."
  type        = string
  default     = "us-central1"
}

variable "livekit_url" {
  description = "WebSocket URL for LiveKit."
  type        = string
  default     = "wss://example.livekit.cloud"
}

variable "livekit_api_key" {
  description = "API key for LiveKit."
  type        = string
}

variable "livekit_secret" {
  description = "Secret for LiveKit."
  type        = string
}

variable "google_api_key" {
  description = "Google API key."
  type        = string
}

variable "database_url" {
  description = "Database connection string."
  type        = string
}

variable "supabase_url" {
  description = "Supabase project URL (public)."
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase anon public key."
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key."
  type        = string
}

variable "openrouter_api_key" {
  description = "OpenRouter API key."
  type        = string
}

variable "google_generative_ai_api_key" {
  description = "Google Generative AI API key."
  type        = string
}

variable "anthropic_api_key" {
  description = "Anthropic API key."
  type        = string
}
