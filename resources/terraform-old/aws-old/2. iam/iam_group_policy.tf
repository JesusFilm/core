resource "aws_iam_group_policy" "tfer--Admins_AdministratorAccess-Admins-201304291421" {
  group = "Admins"
  name  = "AdministratorAccess-Admins-201304291421"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "*",
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
POLICY
}

resource "aws_iam_group_policy" "tfer--PowerUsers_PowerUserAccess-PowerUsers-201304291427" {
  group = "PowerUsers"
  name  = "PowerUserAccess-PowerUsers-201304291427"

  policy = <<POLICY
{
  "Statement": [
    {
      "Effect": "Allow",
      "NotAction": "iam:*",
      "Resource": "*"
    }
  ]
}
POLICY
}

resource "aws_iam_group_policy" "tfer--RedShift-FullAccess_AmazonRedshiftFullAccess-RedShift-FullAccess-201304291434" {
  group = "RedShift-FullAccess"
  name  = "AmazonRedshiftFullAccess-RedShift-FullAccess-201304291434"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "redshift:*",
        "ec2:DescribeAccountAttributes",
        "ec2:DescribeAvailabilityZones",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSubnets",
        "ec2:DescribeVpcs",
        "sns:Get*",
        "sns:List*",
        "cloudwatch:Describe*",
        "cloudwatch:Get*",
        "cloudwatch:List*",
        "cloudwatch:PutMetricAlarm",
        "cloudwatch:EnableAlarmActions",
        "cloudwatch:DisableAlarmActions"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
POLICY
}

resource "aws_iam_group_policy" "tfer--Resources_PowerUserAccess-Resources-201310181445" {
  group = "Resources"
  name  = "PowerUserAccess-Resources-201310181445"

  policy = <<POLICY
{
  "Statement": [
    {
      "Effect": "Allow",
      "NotAction": "iam:*",
      "Resource": "*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY
}

resource "aws_iam_group_policy" "tfer--S3-FullAccess_AmazonS3FullAccess-S3-FullAccess-201304291432" {
  group = "S3-FullAccess"
  name  = "AmazonS3FullAccess-S3-FullAccess-201304291432"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "s3:*",
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
POLICY
}

resource "aws_iam_group_policy" "tfer--S3-Readonly_AmazonS3ReadOnlyAccess-arclight-media-prod" {
  group = "S3-Readonly"
  name  = "AmazonS3ReadOnlyAccess-arclight-media-prod"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:Get*",
        "s3:List*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY
}
