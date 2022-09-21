resource "aws_ssm_parameter" "secret" {
  for_each    = toset(local.global_users)
  name        = "/rds/postgres/global_users/${each.value}"
  description = "scram-sha-256 encrypted postgres password"
  key_id      = module.kms_key.kms_key_arn
  type        = "SecureString"
  value       = "changeme"
  tags        = local.tags
  lifecycle {
    ignore_changes = [
      value
    ]
  }
}
