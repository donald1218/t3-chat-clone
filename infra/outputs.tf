output "voice_bot_vm_external_ip" {
  description = "The external IP address of the voice bot VM instance."
  value       = google_compute_instance.voice_bot_vm.network_interface[0].access_config[0].nat_ip
}

output "voice_bot_vm_name" {
  description = "The name of the voice bot VM instance."
  value       = google_compute_instance.voice_bot_vm.name
}

output "speaches_ai_url" {
  description = "The URL of the deployed Speaches AI Cloud Run service."
  value       = google_cloud_run_v2_service.speaches_ai.uri
}

output "nextjs_server_url" {
  description = "The URL of the deployed Next.js server."
  value       = google_cloud_run_service.nextjs_server.status[0].url
}
