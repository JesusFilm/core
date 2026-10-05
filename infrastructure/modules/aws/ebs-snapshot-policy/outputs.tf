output "policy_id" {
  value = aws_dlm_lifecycle_policy.this.id
}

output "target_volume_ids" {
  value = data.aws_ebs_volumes.targets.ids
}
