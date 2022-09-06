resource "aws_iam_group" "tfer--Admins" {
  name = "Admins"
  path = "/"
}

resource "aws_iam_group" "tfer--DynamoDB_EMR_FullAccess" {
  name = "DynamoDB_EMR_FullAccess"
  path = "/"
}

resource "aws_iam_group" "tfer--JfmDeploymentGroup" {
  name = "JfmDeploymentGroup"
  path = "/"
}

resource "aws_iam_group" "tfer--PowerUsers" {
  name = "PowerUsers"
  path = "/"
}

resource "aws_iam_group" "tfer--RedShift-FullAccess" {
  name = "RedShift-FullAccess"
  path = "/"
}

resource "aws_iam_group" "tfer--Resources" {
  name = "Resources"
  path = "/"
}

resource "aws_iam_group" "tfer--S3-FullAccess" {
  name = "S3-FullAccess"
  path = "/"
}

resource "aws_iam_group" "tfer--S3-Readonly" {
  name = "S3-Readonly"
  path = "/"
}

resource "aws_iam_group" "tfer--S3-onehope-jfm" {
  name = "S3-onehope-jfm"
  path = "/"
}
