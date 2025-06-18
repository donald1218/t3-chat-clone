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
