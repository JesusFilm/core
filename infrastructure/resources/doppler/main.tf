resource "aws_iam_user" "jfp_doppler_integration" {
  name = "jfp-doppler-integration"
}

resource "aws_iam_user_policy" "jfp_doppler_integration" {
  name = "jfp-doppler-integration-ssm-policy"
  user = aws_iam_user.jfp_doppler_integration.name

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowSSMAccess",
            "Effect": "Allow",
            "Action": [
                "ssm:PutParameter",
                "ssm:LabelParameterVersion",
                "ssm:DeleteParameter",
                "ssm:RemoveTagsFromResource",
                "ssm:GetParameterHistory",
                "ssm:AddTagsToResource",
                "ssm:GetParametersByPath",
                "ssm:GetParameters",
                "ssm:GetParameter",
                "ssm:DeleteParameters"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}
