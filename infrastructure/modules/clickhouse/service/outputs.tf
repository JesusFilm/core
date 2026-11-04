output "url" {
  description = "HTTPS endpoint of the service"
  value       = doppler_secret.url.value
}

output "host" {
  description = "Hostname of the service"
  value       = clickhouse_service.this.endpoints.https.host
}
