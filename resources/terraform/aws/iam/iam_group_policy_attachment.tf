resource "aws_iam_group_policy_attachment" "tfer--JfmDeploymentGroup_AmazonEKSClusterPolicy" {
  group      = "JfmDeploymentGroup"
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_group_policy_attachment" "tfer--JfmDeploymentGroup_ElasticLoadBalancingFullAccess" {
  group      = "JfmDeploymentGroup"
  policy_arn = "arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess"
}
