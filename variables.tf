# Application
variable "env" {
  type        = string
  description = "Environment"
  default     = "prod"
}

# VPC
variable "cidr" {
  type        = string
  description = "VPC CIDR"
  default     = "10.10.0.0/16"
}

# Atlantis 
variable "atlantis_github_user_token" {
  type        = string
  description = "jesus-film-bot personal access token"
}

variable "doppler_api_gateway_stage_token" {
  type = string
}

variable "doppler_api_gateway_prod_token" {
  type = string
}

variable "doppler_api_journeys_stage_token" {
  type = string
}

variable "doppler_api_journeys_prod_token" {
  type = string
}

variable "doppler_api_languages_stage_token" {
  type = string
}

variable "doppler_api_languages_prod_token" {
  type = string
}

variable "doppler_api_media_stage_token" {
  type = string
}

variable "doppler_api_media_prod_token" {
  type = string
}

variable "doppler_api_users_stage_token" {
  type = string
}

variable "doppler_api_users_prod_token" {
  type = string
}

variable "doppler_api_videos_stage_token" {
  type = string
}

variable "doppler_api_videos_prod_token" {
  type = string
}

variable "doppler_arangodb_bigquery_etl_prod_token" {
  type = string
}

variable "doppler_arangodb_s3_backup_prod_token" {
  type = string
}
