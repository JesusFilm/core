resource "aws_iam_role" "tfer--AWSServiceRoleForAmazonEKS" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "eks.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows Amazon EKS to call AWS services on your behalf."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AmazonEKSServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForAmazonEKS"
  path                 = "/aws-service-role/eks.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForAmazonEKSNodegroup" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "eks-nodegroup.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "This policy allows Amazon EKS to create and manage Nodegroups"
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSServiceRoleForAmazonEKSNodegroup"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForAmazonEKSNodegroup"
  path                 = "/aws-service-role/eks-nodegroup.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AmazonEKS_EBS_CSI_DriverRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.us-east-2.amazonaws.com/id/61CCB3063C1B952A5A7D9C7F76389240:sub": "system:serviceaccount:kube-system:ebs-csi-controller-sa"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::AKIA5ANCXSXXYJLI3CV2:oidc-provider/oidc.eks.us-east-2.amazonaws.com/id/61CCB3063C1B952A5A7D9C7F76389240"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  max_session_duration = "3600"
  name                 = "AmazonEKS_EBS_CSI_DriverRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--EksAWSControl" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "eks.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows access to other AWS service resources that are required to operate clusters managed by EKS."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"]
  max_session_duration = "3600"
  name                 = "EksAWSControl"
  path                 = "/"
}


resource "aws_iam_role" "tfer--JesusFilmCoreEKSWorkerNodeRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows EC2 instances to call AWS services on your behalf."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly", "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy", "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy", "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"]
  max_session_duration = "3600"
  name                 = "JesusFilmCoreEKSWorkerNodeRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--JfmDnsProvider-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.us-east-2.amazonaws.com/id/61CCB3063C1B952A5A7D9C7F76389240:aud": "sts.amazonaws.com"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::894231352815:oidc-provider/oidc.eks.us-east-2.amazonaws.com/id/61CCB3063C1B952A5A7D9C7F76389240"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/AllowExternalDNSUpdates", "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"]
  max_session_duration = "3600"
  name                 = "JfmDnsProvider-role"
  path                 = "/"

  tags = {
    group = "JesusFilm-core"
  }

  tags_all = {
    group = "JesusFilm-core"
  }
}

resource "aws_iam_role" "tfer--JfmExternalDNS" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.us-east-2.amazonaws.com/id/54A242E78E43553E2574158527ABE3E6:aud": "sts.amazonaws.com"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::894231352815:oidc-provider/oidc.eks.us-east-2.amazonaws.com/id/54A242E78E43553E2574158527ABE3E6"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/AllowExternalDNSUpdates", "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"]
  max_session_duration = "3600"
  name                 = "JfmExternalDNS"
  path                 = "/"
}


resource "aws_iam_role" "tfer--eksctl-JesusFilm-core-addon-iamserviceaccoun-Role1-1MM58AN9NT754" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.us-east-2.amazonaws.com/id/54A242E78E43553E2574158527ABE3E6:aud": "sts.amazonaws.com",
          "oidc.eks.us-east-2.amazonaws.com/id/54A242E78E43553E2574158527ABE3E6:sub": "system:serviceaccount:default:external-dns"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::894231352815:oidc-provider/oidc.eks.us-east-2.amazonaws.com/id/54A242E78E43553E2574158527ABE3E6"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/AllowExternalDNSUpdates"]
  max_session_duration = "3600"
  name                 = "eksctl-JesusFilm-core-addon-iamserviceaccoun-Role1-1MM58AN9NT754"
  path                 = "/"

  tags = {
    "alpha.eksctl.io/cluster-name"                = "JesusFilm-core"
    "alpha.eksctl.io/eksctl-version"              = "0.100.0"
    "alpha.eksctl.io/iamserviceaccount-name"      = "default/external-dns"
    "eksctl.cluster.k8s.io/v1alpha1/cluster-name" = "JesusFilm-core"
  }

  tags_all = {
    "alpha.eksctl.io/cluster-name"                = "JesusFilm-core"
    "alpha.eksctl.io/eksctl-version"              = "0.100.0"
    "alpha.eksctl.io/iamserviceaccount-name"      = "default/external-dns"
    "eksctl.cluster.k8s.io/v1alpha1/cluster-name" = "JesusFilm-core"
  }
}


