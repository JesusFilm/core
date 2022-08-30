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
