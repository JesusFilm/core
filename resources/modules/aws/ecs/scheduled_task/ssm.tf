resource "aws_ssm_parameter" "parameters" {
  for_each = var.env_secrets

  name = "/ecs/${var.identifier}/${var.env}/${each.key}"
  type = "SecureString"
  value = each.value
  overwrite = true
  tags = merge(
    local.tags,
    {
      name = each.key
    }
  )
}