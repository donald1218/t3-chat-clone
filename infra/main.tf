terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = ">= 3.0.2"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "docker" {
  registry_auth {
    address     = "${google_artifact_registry_repository.voice_bot_repo.location}-docker.pkg.dev"
    config_file = pathexpand("~/.docker/config.json")
  }
}

data "external" "git_commit_hash" {
  program = ["${path.module}/git_commit_hash.sh"]
}

locals {
  image_tag = data.external.git_commit_hash.result["commit"]
}

resource "google_storage_bucket" "hf_hub_cache" {
  name                        = "hf-hub-cache-${var.project_id}"
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true
}

resource "google_artifact_registry_repository" "voice_bot_repo" {
  provider      = google
  location      = var.region
  repository_id = "voice-bot-repo"
  description   = "Docker repository for voice-bot images"
  format        = "DOCKER"
}

resource "google_artifact_registry_repository" "ghcr_remote" {
  location      = var.region
  repository_id = "ghcr-remote"
  description   = "Remote repository proxying ghcr.io images"
  format        = "DOCKER"
  mode          = "REMOTE_REPOSITORY"
  remote_repository_config {
    common_repository {
      uri = "https://ghcr.io"
    }
  }
}

resource "null_resource" "gcp_docker_auth" {
  provisioner "local-exec" {
    command = <<-EOT
      gcloud auth configure-docker ${google_artifact_registry_repository.voice_bot_repo.location}-docker.pkg.dev --quiet
      gcloud auth configure-docker ${google_artifact_registry_repository.ghcr_remote.location}-docker.pkg.dev --quiet
    EOT
  }
}

resource "docker_image" "voice_bot" {
  name = "${google_artifact_registry_repository.voice_bot_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.voice_bot_repo.repository_id}/voice-bot:${local.image_tag}"
  build {
    context    = "../voice-bot"
    dockerfile = "../voice-bot/Dockerfile"

    platform = "linux/amd64" # Ensure compatibility with Cloud Run
  }

  force_remove = true
}

resource "docker_registry_image" "voice_bot" {
  name = docker_image.voice_bot.name
}


resource "docker_image" "frontend" {
  name = "${google_artifact_registry_repository.voice_bot_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.voice_bot_repo.repository_id}/nextjs-server:${local.image_tag}"
  build {
    context    = ".."
    dockerfile = "Dockerfile"
    platform   = "linux/amd64" # Ensure compatibility with Cloud Run
  }

  force_remove = true
}

resource "docker_registry_image" "frontend" {
  depends_on = [docker_image.frontend]

  name = docker_image.frontend.name
}


resource "google_cloud_run_service" "speaches_ai" {
  name     = "speaches-ai"
  location = var.region

  template {
    spec {
      containers {
        image = "${google_artifact_registry_repository.ghcr_remote.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.ghcr_remote.repository_id}/speaches-ai/speaches:latest-cpu"
        resources {
          limits = {
            memory = "8Gi"
            cpu    = "4"
          }
        }
        ports {
          container_port = 8000
        }

        volume_mounts {
          name       = "hf-hub-cache"
          mount_path = "/home/ubuntu/.cache/huggingface/hub"

        }
        # NOTE: Cloud Run does not support GPU or persistent volumes. This service downloads model to /tmp at startup.
      }

      volumes {
        name = "hf-hub-cache"
        csi {
          driver    = "gcsfuse.run.googleapis.com"
          read_only = false
          volume_attributes = {
            bucketName = google_storage_bucket.hf_hub_cache.name
          }
        }
      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "speaches_noauth" {
  service  = google_cloud_run_service.speaches_ai.name
  location = google_cloud_run_service.speaches_ai.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_service_account" "voice_bot_sa" {
  account_id   = "voice-bot-sa"
  display_name = "Voice Bot VM Service Account"
}

resource "google_compute_instance" "voice_bot_vm" {
  depends_on = [docker_registry_image.voice_bot]

  name         = "voice-bot-vm"
  machine_type = "e2-standard-2"
  zone         = "${var.region}-b"

  boot_disk {
    initialize_params {
      image = "projects/cos-cloud/global/images/family/cos-stable"
      size  = 30
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  service_account {
    email  = google_service_account.voice_bot_sa.email
    scopes = ["cloud-platform"]
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    set -e
    exec > /var/log/startup-script.log 2>&1
    # Set Docker config to a writable location
    export DOCKER_CONFIG="/var/lib/docker/.docker"
    mkdir -p "$DOCKER_CONFIG"
    # Configure Docker credential helper for Artifact Registry
    docker-credential-gcr configure-docker --registries ${google_artifact_registry_repository.voice_bot_repo.location}-docker.pkg.dev

    # Pull and run the container (service account must have Artifact Registry access)
    docker run -d --restart=always \
      -e LIVEKIT_API_URL='${var.livekit_url}' \
      -e LIVEKIT_API_KEY='${var.livekit_api_key}' \
      -e LIVEKIT_SECRET='${var.livekit_secret}' \
      -e GOOGLE_API_KEY='${var.google_api_key}' \
      -e SPEACHES_URL='${google_cloud_run_service.speaches_ai.status[0].url}/v1' \
      ${google_artifact_registry_repository.voice_bot_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.voice_bot_repo.repository_id}/voice-bot:${local.image_tag}
  EOT
}

resource "google_artifact_registry_repository_iam_member" "voice_bot_repo_reader" {
  project    = var.project_id
  location   = google_artifact_registry_repository.voice_bot_repo.location
  repository = google_artifact_registry_repository.voice_bot_repo.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.voice_bot_sa.email}"
}

resource "google_project_iam_member" "voice_bot_sa_artifact_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.voice_bot_sa.email}"
}

resource "google_cloud_run_service" "nextjs_server" {
  depends_on = [docker_image.frontend, docker_registry_image.frontend]

  name     = "nextjs-server"
  location = var.region

  template {
    spec {
      containers {
        image = "${google_artifact_registry_repository.voice_bot_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.voice_bot_repo.repository_id}/nextjs-server:${local.image_tag}"
        resources {
          limits = {
            memory = "1Gi"
            cpu    = "1"
          }
        }
        ports {
          container_port = 3000
        }
        env {
          name  = "DATABASE_URL"
          value = var.database_url
        }
        env {
          name  = "SUPABASE_URL"
          value = var.supabase_url
        }
        env {
          name  = "SUPABASE_ANON_KEY"
          value = var.supabase_anon_key
        }
        env {
          name  = "LIVEKIT_API_KEY"
          value = var.livekit_api_key
        }
        env {
          name  = "LIVEKIT_API_SECRET"
          value = var.livekit_secret
        }
        env {
          name  = "LIVEKIT_URL"
          value = var.livekit_url
        }
        env {
          name  = "OPENAI_API_KEY"
          value = var.openai_api_key
        }
        env {
          name  = "OPENROUTER_API_KEY"
          value = var.openrouter_api_key
        }
        env {
          name  = "ANTHROPIC_API_KEY"
          value = var.anthropic_api_key
        }
        env {
          name  = "GOOGLE_API_KEY"
          value = var.google_api_key
        }
        env {
          name  = "GOOGLE_GENERATIVE_AI_API_KEY"
          value = var.google_generative_ai_api_key
        }
        env {
          name  = "NODE_ENV"
          value = "production"
        }
      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "nextjs_server_noauth" {
  service  = google_cloud_run_service.nextjs_server.name
  location = google_cloud_run_service.nextjs_server.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
