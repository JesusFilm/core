resource "aws_ssm_parameter" "parameter" {

  name      = "/ecs/${var.identifier}/${var.env}/${var.key}"
  type      = "SecureString"
  value     = var.value
  overwrite = true
  tags = merge(
    local.tags,
    {
      param_type   = var.param_type
      project_name = var.identifier
    }
  )
}

output "parameter_value" {
  description = "Value of ssm parameter"
  value       = var.value
  sensitive   = true
}
