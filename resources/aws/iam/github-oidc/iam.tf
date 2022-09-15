locals {
  hostname = "token.actions.githubusercontent.com"
}

data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com/.well-known/openid-configuration"
}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://${local.hostname}"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.github.certificates[0].sha1_fingerprint]
}

output "github_oidc_arn" {
  description = "The ARN assigned by AWS for the GitHub OIDC provider."
  value       = aws_iam_openid_connect_provider.github.arn
}

output "github_provider_hostname" {
  description = "The URL of the identity provider. Corresponds to the iss claim."
  value       = local.hostname
}
