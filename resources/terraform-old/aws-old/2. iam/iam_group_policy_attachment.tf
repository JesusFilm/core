resource "aws_iam_group_policy_attachment" "tfer--DynamoDB_EMR_FullAccess_AmazonDynamoDBFullAccess" {
  group      = "DynamoDB_EMR_FullAccess"
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_group_policy_attachment" "tfer--DynamoDB_EMR_FullAccess_AmazonElasticMapReduceFullAccess" {
  group      = "DynamoDB_EMR_FullAccess"
  policy_arn = "arn:aws:iam::aws:policy/AmazonElasticMapReduceFullAccess"
}

resource "aws_iam_group_policy_attachment" "tfer--JfmDeploymentGroup_AmazonEKSClusterPolicy" {
  group      = "JfmDeploymentGroup"
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_group_policy_attachment" "tfer--JfmDeploymentGroup_ElasticLoadBalancingFullAccess" {
  group      = "JfmDeploymentGroup"
  policy_arn = "arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess"
}

resource "aws_iam_group_policy_attachment" "tfer--PowerUsers_AWSLambdaFullAccess" {
  group      = "PowerUsers"
  policy_arn = "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
}
