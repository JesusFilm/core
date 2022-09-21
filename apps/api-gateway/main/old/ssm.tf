resource "aws_ssm_parameter" "parameters" {
  for_each = local.env_secrets

  name = "/ecs/${local.identifier}/${local.env}/${each.key}"
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