resource "aws_iam_role" "eks-cluster" {
  name = "terraform-eks-cluster-${var.env}"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "eks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "eks-cluster-AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks-cluster.name
}

resource "aws_iam_role_policy_attachment" "eks-cluster-AmazonEKSServicePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
  role       = aws_iam_role.eks-cluster.name
}

resource "aws_security_group" "eks-cluster" {
  name        = "terraform-eks-cluster-${var.env}"
  description = "Cluster communication with worker nodes"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    "kubernetes.io/cluster/${var.name}-${var.env}" = "owned",
  }
}

resource "aws_eks_cluster" "this" {
  name     = "${var.name}-${var.env}"
  role_arn = aws_iam_role.eks-cluster.arn
  version  = "1.31"

  vpc_config {
    security_group_ids = concat([aws_security_group.eks-cluster.id], var.security_group_ids)
    subnet_ids         = var.subnet_ids
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks-cluster-AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.eks-cluster-AmazonEKSServicePolicy
  ]

  tags = {
    "alpha.eksctl.io/cluster-oidc-enabled" = "true"
  }
}

# Worker Nodes

resource "aws_iam_role" "eks-node" {
  name = "terraform-eks-node-${var.env}"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "eks-node-AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks-node.name
}

resource "aws_iam_role_policy_attachment" "eks-node-AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks-node.name
}

resource "aws_iam_role_policy_attachment" "eks-node-AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks-node.name
}

resource "aws_iam_instance_profile" "eks-node" {
  name = "terraform-eks-node-${var.env}"
  role = aws_iam_role.eks-node.name
}

resource "aws_security_group" "eks-node" {
  name        = "terraform-eks-node-${var.env}"
  description = "Security group for all nodes in the cluster"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "eks-node-ingress-self" {
  description              = "Allow node to communicate with each other"
  from_port                = 0
  protocol                 = "-1"
  security_group_id        = aws_security_group.eks-node.id
  source_security_group_id = aws_security_group.eks-node.id
  to_port                  = 65535
  type                     = "ingress"
}

resource "aws_security_group_rule" "eks-node-ingress-cluster-https" {
  description              = "Allow worker Kubelets and pods to receive communication from the cluster control plane"
  from_port                = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.eks-node.id
  source_security_group_id = var.security_group_ids[0]
  to_port                  = 443
  type                     = "ingress"
}

resource "aws_security_group_rule" "eks-node-ingress-cluster-others" {
  description              = "Allow worker Kubelets and pods to receive communication from the cluster control plane"
  from_port                = 1025
  protocol                 = "tcp"
  security_group_id        = aws_security_group.eks-node.id
  source_security_group_id = var.security_group_ids[0]
  to_port                  = 65535
  type                     = "ingress"
}

resource "aws_security_group_rule" "eks-cluster-ingress-node-https" {
  description              = "Allow pods to communicate with the cluster API Server"
  from_port                = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.eks-cluster.id
  source_security_group_id = aws_security_group.eks-node.id
  to_port                  = 443
  type                     = "ingress"
}

data "aws_ami" "eks-worker" {
  filter {
    name   = "name"
    values = ["amazon-eks-node-${aws_eks_cluster.this.version}-v*"]
  }

  most_recent = true
  owners      = ["602401143452"] # Amazon EKS AMI Account ID
}

# # This data source is included for ease of sample architecture deployment
# # and can be swapped out as necessary.
# data "aws_region" "current" {}

# # EKS currently documents this required userdata for EKS worker nodes to
# # properly configure Kubernetes applications on the EC2 instance.
# # We utilize a Terraform local here to simplify Base64 encoding this
# # information into the AutoScaling Launch Configuration.
# # More information: https://docs.aws.amazon.com/eks/latest/userguide/launch-workers.html
# locals {
#   eks-node-userdata = <<USERDATA
# #!/bin/bash
# set -o xtrace
# /etc/eks/bootstrap.sh '${var.name}-${var.env}' --apiserver-endpoint '${aws_eks_cluster.this.endpoint}' --b64-cluster-ca '${aws_eks_cluster.this.certificate_authority.0.data}' 
# USERDATA
# }

# resource "aws_launch_configuration" "this" {
#   associate_public_ip_address = true
#   iam_instance_profile        = aws_iam_instance_profile.eks-node.name
#   image_id                    = data.aws_ami.eks-worker.id
#   instance_type               = "t3.medium"
#   name_prefix                 = "terraform-eks-${var.env}"
#   security_groups             = [aws_security_group.eks-node.id]
#   user_data_base64            = base64encode(local.eks-node-userdata)

#   lifecycle {
#     create_before_destroy = true
#   }
# }

# resource "aws_autoscaling_group" "this" {
#   desired_capacity     = 1
#   launch_configuration = aws_launch_configuration.this.id
#   max_size             = 4
#   min_size             = 1
#   name                 = "terraform-eks-${var.env}"
#   vpc_zone_identifier  = var.subnet_ids
#   tag {
#     key                 = "kubernetes.io/cluster/${var.name}-${var.env}"
#     value               = "owned"
#     propagate_at_launch = true
#   }
# }

resource "aws_eks_node_group" "az_2a" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "jfp-eks-node-group-2a-${var.env}"
  node_role_arn   = aws_iam_role.eks-node.arn
  subnet_ids      = var.subnet_ids_2a

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 2
  }

  update_config {
    max_unavailable = 2
  }
  capacity_type = "SPOT"

  instance_types = ["t3.large"]

  # Ensure that IAM Role permissions are created before and deleted after EKS Node Group handling.
  # Otherwise, EKS will not be able to properly delete EC2 Instances and Elastic Network Interfaces.
  depends_on = [
    aws_iam_role_policy_attachment.eks-node-AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.eks-node-AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.eks-node-AmazonEC2ContainerRegistryReadOnly,
  ]
}
