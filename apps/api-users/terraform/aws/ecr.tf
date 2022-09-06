resource "aws_ecr_repository" "tfer--jfp-api-users" {
  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = "false"
  }

  image_tag_mutability = "MUTABLE"
  name                 = "jfp-api-users"
}

resource "aws_ecr_repository_policy" "tfer--jfp-api-users" {
  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:CompleteLayerUpload",
        "ecr:GetDownloadUrlForLayer",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::894231352815:user/JfmGithubUser"
      },
      "Sid": "AllowPushPull"
    }
  ],
  "Version": "2008-10-17"
}
POLICY

  repository = "jfp-api-users"
}