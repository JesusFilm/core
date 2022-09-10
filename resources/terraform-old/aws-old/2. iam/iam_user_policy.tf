
resource "aws_iam_user_policy" "tfer--ETL_User_Access_refresh-api-keys_Logs" {
  name = "Access_refresh-api-keys_Logs"

  policy = <<POLICY
{
  "Statement": {
    "Action": "logs:*",
    "Effect": "Allow",
    "Resource": "arn:aws:logs:us-east-1:894231352815:log-group:/jfp/me2/refresh-api-keys/*:*"
  },
  "Version": "2012-10-17"
}
POLICY

  user = "ETL_User"
}

resource "aws_iam_user_policy" "tfer--JfmGithubUser_ECRFullAccess" {
  name = "ECRFullAccess"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "ecr:GetRegistryPolicy",
        "ecr:DescribeRegistry",
        "ecr:DescribePullThroughCacheRules",
        "ecr:GetAuthorizationToken",
        "ecr:PutRegistryScanningConfiguration",
        "ecr:DeleteRegistryPolicy",
        "ecr:CreatePullThroughCacheRule",
        "ecr:DeletePullThroughCacheRule",
        "ecr:PutRegistryPolicy",
        "ecr:GetRegistryScanningConfiguration",
        "ecr:PutReplicationConfiguration"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "VisualEditor0"
    },
    {
      "Action": "ecr:*",
      "Effect": "Allow",
      "Resource": "arn:aws:ecr:*:894231352815:repository/*",
      "Sid": "VisualEditor1"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  user = "JfmGithubUser"
}
