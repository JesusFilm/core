output "kms_key_arn" {
  value       = aws_kms_key.default.arn
  description = "The Amazon Resource Name (ARN) specifying the key."
}

output "kms_key_description" {
  value       = aws_kms_key.default.description
  description = "The description of the key."
}

output "kms_key_policy_document" {
  value       = aws_kms_key.default.policy
  description = "The policy document."
}

output "kms_alias_arn" {
  value       = aws_kms_alias.default.arn
  description = "The Amazon Resource Name (ARN) specifying the key."
}

output "kms_alias_name" {
  value       = aws_kms_alias.default.name
  description = "The name of the key alias."
}
