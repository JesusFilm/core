resource "aws_ecr_repository" "tfer--jfp-api-journeys" {
  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = "false"
  }

  image_tag_mutability = "MUTABLE"
  name                 = "jfp-api-journeys"
}

resource "aws_ecr_repository_policy" "tfer--jfp-api-journeys" {
  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
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

  repository = "jfp-api-journeys"
}