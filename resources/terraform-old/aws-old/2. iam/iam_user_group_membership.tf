resource "aws_iam_user_group_membership" "tfer--ETL_User-002F-DynamoDB_EMR_FullAccess" {
  groups = ["DynamoDB_EMR_FullAccess"]
  user   = "ETL_User"
}

resource "aws_iam_user_group_membership" "tfer--JfmGithubUser-002F-JfmDeploymentGroup" {
  groups = ["JfmDeploymentGroup"]
  user   = "JfmGithubUser"
}

resource "aws_iam_user_group_membership" "tfer--docker-registry-user-002F-S3-FullAccess" {
  groups = ["S3-FullAccess"]
  user   = "docker-registry-user"
}

resource "aws_iam_user_group_membership" "tfer--jfm_data_export_s3-002F-S3-FullAccess" {
  groups = ["S3-FullAccess"]
  user   = "jfm_data_export_s3"
}
