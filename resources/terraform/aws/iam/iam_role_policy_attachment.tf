
resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAmazonEKSNodegroup_AWSServiceRoleForAmazonEKSNodegroup" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSServiceRoleForAmazonEKSNodegroup"
  role       = "AWSServiceRoleForAmazonEKSNodegroup"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAmazonEKS_AmazonEKSServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonEKSServiceRolePolicy"
  role       = "AWSServiceRoleForAmazonEKS"
}

resource "aws_iam_role_policy_attachment" "tfer--EksAWSControl_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = "EksAWSControl"
}

resource "aws_iam_role_policy_attachment" "tfer--JesusFilmCoreEKSWorkerNodeRole_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_role_policy_attachment" "tfer--JesusFilmCoreEKSWorkerNodeRole_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_role_policy_attachment" "tfer--JesusFilmCoreEKSWorkerNodeRole_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_role_policy_attachment" "tfer--JesusFilmCoreEKSWorkerNodeRole_AmazonSSMManagedInstanceCore" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_role_policy_attachment" "tfer--JfmDnsProvider-role_AllowExternalDNSUpdates" {
  policy_arn = "arn:aws:iam::894231352815:policy/AllowExternalDNSUpdates"
  role       = "JfmDnsProvider-role"
}

resource "aws_iam_role_policy_attachment" "tfer--JfmDnsProvider-role_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = "JfmDnsProvider-role"
}

resource "aws_iam_role_policy_attachment" "tfer--JfmExternalDNS_AllowExternalDNSUpdates" {
  policy_arn = "arn:aws:iam::894231352815:policy/AllowExternalDNSUpdates"
  role       = "JfmExternalDNS"
}

resource "aws_iam_role_policy_attachment" "tfer--JfmExternalDNS_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = "JfmExternalDNS"
}

resource "aws_iam_role_policy_attachment" "tfer--api-gateway-log-writer_AmazonAPIGatewayPushToCloudWatchLogs" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
  role       = "api-gateway-log-writer"
}
