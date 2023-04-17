terraform {
  required_providers {
    doppler = {
      source = "DopplerHQ/doppler"
    }
  }
  required_version = ">= 1.0.9"
}

provider "doppler" {
  doppler_token = var.doppler_token
}
