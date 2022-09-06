resource "aws_ecr_repository" "tfer--jfp-api-languages" {
  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = "false"
  }

  image_tag_mutability = "MUTABLE"
  name                 = "jfp-api-languages"
}

