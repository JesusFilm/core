resource "aws_ecr_repository" "tfer--jfp-arangodb-bigquery-etl" {
  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = "false"
  }

  image_tag_mutability = "MUTABLE"
  name                 = "jfp-arangodb-bigquery-etl"
}

resource "aws_ecr_repository" "tfer--jfp-arangodb-s3-backup" {
  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = "false"
  }

  image_tag_mutability = "MUTABLE"
  name                 = "jfp-arangodb-s3-backup"
}
