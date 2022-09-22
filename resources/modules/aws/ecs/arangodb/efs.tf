resource "aws_efs_file_system" "arangodb" {
  creation_token = local.name
  performance_mode = "maxIO"

  tags = local.tags
}