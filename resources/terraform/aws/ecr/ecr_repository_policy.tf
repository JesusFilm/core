resource "aws_ecr_repository_policy" "tfer--jfp-api-gateway" {
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

  repository = "jfp-api-gateway"
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
