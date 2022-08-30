resource "aws_iam_user_group_membership" "tfer--JfmGithubUser-002F-JfmDeploymentGroup" {
  groups = ["JfmDeploymentGroup"]
  user   = "JfmGithubUser"
}
