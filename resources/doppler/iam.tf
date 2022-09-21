resource "aws_iam_user" "jfp_doppler_integration" {
  name = "jfp-doppler-integration"
  path = "/system/"

  tags = {
    tag-key = "tag-value"
  }
}

resource "aws_iam_access_key" "jfp_doppler_integration" {
  user = aws_iam_user.jfp_doppler_integration.name
}

resource "aws_iam_user_policy" "jfp_doppler_integration" {
  name = "jfp-doppler-integration-policy"
  user = aws_iam_user.jfp_doppler_integration.name

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowSecretsManagerAccess",
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret",
                "secretsmanager:PutSecretValue",
                "secretsmanager:CreateSecret",
                "secretsmanager:DeleteSecret",
                "secretsmanager:TagResource",
                "secretsmanager:UpdateSecret"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}