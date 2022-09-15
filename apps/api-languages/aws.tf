resource "aws_ecr_repository" "main" {
  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = "false"
  }

  image_tag_mutability = "MUTABLE"
  name                 = "jfp-${local.identifier}"
  tags                 = local.tags
}

# TODO: Add ecr_lifecycle_policy