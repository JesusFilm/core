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



resource "aws_iam_role" "tfer--AWSServiceRoleForAmazonSSM" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ssm.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Provides access to AWS Resources managed or used by Amazon SSM."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AmazonSSMServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForAmazonSSM"
  path                 = "/aws-service-role/ssm.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForApplicationAutoScaling_ECSService" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs.application-autoscaling.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSApplicationAutoscalingECSServicePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForApplicationAutoScaling_ECSService"
  path                 = "/aws-service-role/ecs.application-autoscaling.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForAutoScaling" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "autoscaling.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Default Service-Linked Role enables access to AWS Services and Resources used or managed by Auto Scaling"
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AutoScalingServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForAutoScaling"
  path                 = "/aws-service-role/autoscaling.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForBackup" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "backup.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSBackupServiceLinkedRolePolicyForBackup"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForBackup"
  path                 = "/aws-service-role/backup.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForCloudFrontLogger" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "logger.cloudfront.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSCloudFrontLogger"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForCloudFrontLogger"
  path                 = "/aws-service-role/logger.cloudfront.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForCloudTrail" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudtrail.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/CloudTrailServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForCloudTrail"
  path                 = "/aws-service-role/cloudtrail.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForECS" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Role to enable Amazon ECS to manage your cluster."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AmazonECSServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForECS"
  path                 = "/aws-service-role/ecs.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForEMRCleanup" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "elasticmapreduce.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows EMR to terminate instances and delete resources from EC2 on your behalf."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AmazonEMRCleanupPolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForEMRCleanup"
  path                 = "/aws-service-role/elasticmapreduce.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForElastiCache" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "elasticache.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows ElastiCache to manage AWS resources for your cache on your behalf."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/ElastiCacheServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForElastiCache"
  path                 = "/aws-service-role/elasticache.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForElasticBeanstalk" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "elasticbeanstalk.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows Elastic Beanstalk to call AWS services (like AutoScaling and EC2) to create and manage resources on your behalf."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSElasticBeanstalkServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForElasticBeanstalk"
  path                 = "/aws-service-role/elasticbeanstalk.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForElasticLoadBalancing" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "elasticloadbalancing.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows ELB to call AWS services on your behalf."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSElasticLoadBalancingServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForElasticLoadBalancing"
  path                 = "/aws-service-role/elasticloadbalancing.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForGlobalAccelerator" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "globalaccelerator.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows Global Accelerator to call AWS services on customer's behalf"
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSGlobalAcceleratorSLRPolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForGlobalAccelerator"
  path                 = "/aws-service-role/globalaccelerator.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForOrganizations" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "organizations.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Service-linked role used by AWS Organizations to enable integration of other AWS services with Organizations."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSOrganizationsServiceTrustPolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForOrganizations"
  path                 = "/aws-service-role/organizations.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForRDS" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "rds.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows Amazon RDS to manage AWS resources on your behalf"
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AmazonRDSServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForRDS"
  path                 = "/aws-service-role/rds.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForRedshift" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "redshift.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows Amazon Redshift to call AWS services on your behalf."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AmazonRedshiftServiceLinkedRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForRedshift"
  path                 = "/aws-service-role/redshift.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForSSO" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "sso.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Service-linked role used by AWS SSO to manage AWS resources, including IAM roles, policies and SAML IdP on your behalf."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSSSOServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForSSO"
  path                 = "/aws-service-role/sso.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForServiceQuotas" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "servicequotas.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "A service-linked role is required for Service Quotas to access your service limits."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/ServiceQuotasServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForServiceQuotas"
  path                 = "/aws-service-role/servicequotas.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForSupport" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "support.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Enables resource access for AWS to provide billing, administrative and support services"
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSSupportServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForSupport"
  path                 = "/aws-service-role/support.amazonaws.com/"
}

resource "aws_iam_role" "tfer--AWSServiceRoleForTrustedAdvisor" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "trustedadvisor.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Access for the AWS Trusted Advisor Service to help reduce cost, increase performance, and improve security of your AWS environment."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/aws-service-role/AWSTrustedAdvisorServiceRolePolicy"]
  max_session_duration = "3600"
  name                 = "AWSServiceRoleForTrustedAdvisor"
  path                 = "/aws-service-role/trustedadvisor.amazonaws.com/"
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

resource "aws_iam_role" "tfer--Arclight-Cache-Clearer" {
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

  description          = "Allows describing the Arclight autoscaling group."
  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/ArclightConfigsS3ReadOnly", "arn:aws:iam::894231352815:policy/ArclightDescribeResources", "arn:aws:iam::aws:policy/AutoScalingReadOnlyAccess"]
  max_session_duration = "3600"
  name                 = "Arclight-Cache-Clearer"
  path                 = "/"
}

resource "aws_iam_role" "tfer--Arclight-Config-Fetcher" {
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

  description          = "Allows Arclight WFEs to fetch config files from S3"
  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/ArclightConfigsS3ReadOnly", "arn:aws:iam::894231352815:policy/ArclightDescribeResources", "arn:aws:iam::aws:policy/AmazonKinesisFirehoseFullAccess", "arn:aws:iam::aws:policy/AmazonKinesisFullAccess"]
  max_session_duration = "3600"
  name                 = "Arclight-Config-Fetcher"
  path                 = "/"
}

resource "aws_iam_role" "tfer--ArclightCodeDeploy" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codedeploy.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows CodeDeploy to interact with EC2 instances"
  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"]
  max_session_duration = "3600"
  name                 = "ArclightCodeDeploy"
  path                 = "/"
}

resource "aws_iam_role" "tfer--BitbucketCodeDeployer" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "connection:2660786"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::984525101146:root"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows BitBucket CodeDeploy add-on to deploy code to EC2 instances."
  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/BitbucketCodeDeployToS3"]
  max_session_duration = "3600"
  name                 = "BitbucketCodeDeployer"
  path                 = "/"
}

resource "aws_iam_role" "tfer--DataPipelineDefaultResourceRole" {
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

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforDataPipelineRole"]
  max_session_duration = "3600"
  name                 = "DataPipelineDefaultResourceRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--DataPipelineDefaultRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "datapipeline.amazonaws.com",
          "elasticmapreduce.amazonaws.com"
        ]
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AWSDataPipelineRole"]
  max_session_duration = "3600"
  name                 = "DataPipelineDefaultRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--EMR_DefaultRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "elasticmapreduce.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2008-10-17"
}
POLICY

  inline_policy {
    name   = "EMR_DefaultRole"
    policy = "{\n  \"Statement\": [\n    {\n      \"Action\": [\n        \"ec2:AuthorizeSecurityGroupIngress\",\n        \"ec2:CancelSpotInstanceRequests\",\n        \"ec2:CreateSecurityGroup\",\n        \"ec2:CreateTags\",\n        \"ec2:DeleteTags\",\n        \"ec2:Describe*\",\n        \"ec2:ModifyImageAttribute\",\n        \"ec2:ModifyInstanceAttribute\",\n        \"ec2:RequestSpotInstances\",\n        \"ec2:RunInstances\",\n        \"ec2:TerminateInstances\",\n        \"iam:PassRole\",\n        \"iam:ListRolePolicies\",\n        \"iam:GetRole\",\n        \"iam:GetRolePolicy\",\n        \"iam:ListInstanceProfiles\",\n        \"s3:Get*\",\n        \"s3:CreateBucket\",\n        \"s3:List*\",\n        \"sdb:BatchPutAttributes\",\n        \"sdb:Select\"\n      ],\n      \"Effect\": \"Allow\",\n      \"Resource\": \"*\"\n    }\n  ]\n}\n"
  }

  max_session_duration = "3600"
  name                 = "EMR_DefaultRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--EMR_EC2_DefaultRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2008-10-17"
}
POLICY

  inline_policy {
    name   = "EMR_EC2_DefaultRole"
    policy = "{\n  \"Statement\": [\n    {\n      \"Action\": [\n        \"cloudwatch:*\",\n        \"dynamodb:*\",\n        \"ec2:Describe*\",\n        \"elasticmapreduce:Describe*\",\n        \"rds:Describe*\",\n        \"s3:*\",\n        \"sdb:*\",\n        \"sns:*\",\n        \"sqs:*\"\n      ],\n      \"Effect\": \"Allow\",\n      \"Resource\": \"*\"\n    }\n  ]\n}\n"
  }

  max_session_duration = "3600"
  name                 = "EMR_EC2_DefaultRole"
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

resource "aws_iam_role" "tfer--Elastic_Transcoder_Default_Role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "elastictranscoder.amazonaws.com"
      },
      "Sid": "1"
    }
  ],
  "Version": "2008-10-17"
}
POLICY

  inline_policy {
    name   = "ets-console-generated-policy"
    policy = "{\"Version\":\"2008-10-17\",\"Statement\":[{\"Sid\":\"1\",\"Effect\":\"Allow\",\"Action\":[\"s3:Put*\",\"s3:ListBucket\",\"s3:*MultipartUpload*\",\"s3:Get*\"],\"Resource\":\"*\"},{\"Sid\":\"2\",\"Effect\":\"Allow\",\"Action\":\"sns:Publish\",\"Resource\":\"*\"},{\"Sid\":\"3\",\"Effect\":\"Deny\",\"Action\":[\"s3:*Delete*\",\"s3:*Policy*\",\"sns:*Remove*\",\"sns:*Delete*\",\"sns:*Permission*\"],\"Resource\":\"*\"}]}"
  }

  max_session_duration = "3600"
  name                 = "Elastic_Transcoder_Default_Role"
  path                 = "/"
}

resource "aws_iam_role" "tfer--IngestMe2Events" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "firehose.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/AmazonS3FullAccess", "arn:aws:iam::aws:policy/CloudWatchFullAccess"]
  max_session_duration = "3600"
  name                 = "IngestMe2Events"
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

resource "aws_iam_role" "tfer--NexusMediaComponentIngest-role-apxuuycg" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-cf8927a7-eaaa-47b5-bdc0-7708c33c4877"]
  max_session_duration = "3600"
  name                 = "NexusMediaComponentIngest-role-apxuuycg"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--OrganizationAccountAccessRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Condition": {},
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::056154071827:root"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Provides access to CRU IT"
  managed_policy_arns  = ["arn:aws:iam::aws:policy/AdministratorAccess"]
  max_session_duration = "3600"
  name                 = "OrganizationAccountAccessRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--amplify-jfwordpress-dev-142551-authRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Effect": "Deny",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  max_session_duration = "3600"
  name                 = "amplify-jfwordpress-dev-142551-authRole"
  path                 = "/"

  tags = {
    "user:Application" = "jfwordpress"
    "user:Stack"       = "dev"
  }

  tags_all = {
    "user:Application" = "jfwordpress"
    "user:Stack"       = "dev"
  }
}

resource "aws_iam_role" "tfer--amplify-jfwordpress-dev-142551-unauthRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Effect": "Deny",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  max_session_duration = "3600"
  name                 = "amplify-jfwordpress-dev-142551-unauthRole"
  path                 = "/"

  tags = {
    "user:Application" = "jfwordpress"
    "user:Stack"       = "dev"
  }

  tags_all = {
    "user:Application" = "jfwordpress"
    "user:Stack"       = "dev"
  }
}

resource "aws_iam_role" "tfer--api-example-2-dev-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "api-example-2-dev-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-example-2-dev*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-example-2-dev*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  max_session_duration = "3600"
  name                 = "api-example-2-dev-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "dev"
  }

  tags_all = {
    STAGE = "dev"
  }
}

resource "aws_iam_role" "tfer--api-example-dev-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "api-example-dev-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-example-dev*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-example-dev*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  max_session_duration = "3600"
  name                 = "api-example-dev-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "dev"
  }

  tags_all = {
    STAGE = "dev"
  }
}

resource "aws_iam_role" "tfer--api-gateway-log-writer" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"]
  max_session_duration = "3600"
  name                 = "api-gateway-log-writer"
  path                 = "/"
}

resource "aws_iam_role" "tfer--api-journeys-dev-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "api-journeys-dev-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-dev*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-dev*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"]
  max_session_duration = "3600"
  name                 = "api-journeys-dev-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "dev"
  }

  tags_all = {
    STAGE = "dev"
  }
}

resource "aws_iam_role" "tfer--api-journeys-prod-prod-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "api-journeys-prod-prod-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-prod-prod*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-prod-prod*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"]
  max_session_duration = "3600"
  name                 = "api-journeys-prod-prod-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "prod"
  }

  tags_all = {
    STAGE = "prod"
  }
}

resource "aws_iam_role" "tfer--api-journeys-prod-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "api-journeys-prod-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-prod*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-prod*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"]
  max_session_duration = "3600"
  name                 = "api-journeys-prod-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "prod"
  }

  tags_all = {
    STAGE = "prod"
  }
}

resource "aws_iam_role" "tfer--api-journeys-stage-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "api-journeys-stage-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-stage*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-stage*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"]
  max_session_duration = "3600"
  name                 = "api-journeys-stage-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "stage"
  }

  tags_all = {
    STAGE = "stage"
  }
}

resource "aws_iam_role" "tfer--api-media-dev-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "access-ark-core-bucket"
    policy = "{\n    \"Version\": \"2012-10-17\",\n    \"Statement\": [\n        {\n          \"Effect\": \"Allow\",\n          \"Action\": [\n                \"s3:Put*\",\n                \"s3:Get*\",\n                \"s3:Delete*\"\n            ],\n            \"Resource\": [\n                \"arn:aws:s3:::ark-core/*\"\n            ]\n        }\n    ]\n}\n"
  }

  inline_policy {
    name   = "api-media-dev-lambda"
    policy = "{\n    \"Version\": \"2012-10-17\",\n    \"Statement\": [\n        {\n            \"Action\": [\n                \"logs:CreateLogStream\",\n                \"logs:CreateLogGroup\"\n            ],\n            \"Resource\": [\n                \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-media-dev*:*\"\n            ],\n            \"Effect\": \"Allow\"\n        },\n        {\n            \"Action\": [\n                \"logs:PutLogEvents\"\n            ],\n            \"Resource\": [\n                \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-media-dev*:*:*\"\n            ],\n            \"Effect\": \"Allow\"\n        }\n    ]\n}"
  }

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/AccessArkCoreBucketObjects", "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"]
  max_session_duration = "3600"
  name                 = "api-media-dev-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "dev"
  }

  tags_all = {
    STAGE = "dev"
  }
}

resource "aws_iam_role" "tfer--api-media-stage-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "AccessArkMediaS3"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"AccessArkMediaS3\",\n      \"Action\": [\n        \"s3:GetObject\"\n      ],\n      \"Effect\": \"Allow\",\n      \"Resource\": [\n        \"arn:aws:s3:::ark-core/media/*\"\n      ]\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "api-media-stage-lambda"
    policy = "{\n    \"Version\": \"2012-10-17\",\n    \"Statement\": [\n        {\n            \"Action\": [\n                \"logs:CreateLogStream\",\n                \"logs:CreateLogGroup\"\n            ],\n            \"Resource\": [\n                \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-media-stage*:*\"\n            ],\n            \"Effect\": \"Allow\"\n        },\n        {\n            \"Action\": [\n                \"logs:PutLogEvents\"\n            ],\n            \"Resource\": [\n                \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-media-stage*:*:*\"\n            ],\n            \"Effect\": \"Allow\"\n        }\n    ]\n}"
  }

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/AccessArkCoreBucketObjects", "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"]
  max_session_duration = "3600"
  name                 = "api-media-stage-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "stage"
  }

  tags_all = {
    STAGE = "stage"
  }
}

resource "aws_iam_role" "tfer--api-test-dev-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "api-test-dev-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-test-dev*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-test-dev*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  max_session_duration = "3600"
  name                 = "api-test-dev-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "dev"
  }

  tags_all = {
    STAGE = "dev"
  }
}

resource "aws_iam_role" "tfer--api-test1-dev-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "api-test1-dev-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-test1-dev*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-test1-dev*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  max_session_duration = "3600"
  name                 = "api-test1-dev-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "dev"
  }

  tags_all = {
    STAGE = "dev"
  }
}

resource "aws_iam_role" "tfer--appsync-ds-lam-3elgqd-wp-graphql-request" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "appsync.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows the AWS AppSync service to access your data source."
  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/appsync-ds-lam-3elgqd-wp-graphql-request"]
  max_session_duration = "3600"
  name                 = "appsync-ds-lam-3elgqd-wp-graphql-request"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--appsync-graphqlapi-logs-us-west-2" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "appsync.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows the AWS AppSync service to access your data source."
  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/appsync-graphqlapi-logs-us-west-2"]
  max_session_duration = "3600"
  name                 = "appsync-graphqlapi-logs-us-west-2"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--arclight-apikey-authorize-role-yohbtjp8" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-036eff25-465f-4bef-8136-da7954a08906"]
  max_session_duration = "3600"
  name                 = "arclight-apikey-authorize-role-yohbtjp8"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--arclight-outage-slack-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-e5a128db-70f8-43ed-9fc9-d87628a50fef", "arn:aws:iam::894231352815:policy/service-role/AWSLambdaKMSExecutionRole-0af2c3fd-6a0a-46c0-9568-b1f194068eb9"]
  max_session_duration = "3600"
  name                 = "arclight-outage-slack-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--aurora-s3-full-access" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "rds.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows you to grant RDS access to additional resources on your behalf."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/AmazonS3FullAccess"]
  max_session_duration = "3600"
  name                 = "aurora-s3-full-access"
  path                 = "/"
}

resource "aws_iam_role" "tfer--aws-elasticbeanstalk-ec2-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2008-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker", "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier", "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier", "arn:aws:iam::aws:policy/AmazonS3FullAccess"]
  max_session_duration = "3600"
  name                 = "aws-elasticbeanstalk-ec2-role"
  path                 = "/"
}

resource "aws_iam_role" "tfer--aws-elasticbeanstalk-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "elasticbeanstalk"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Service": "elasticbeanstalk.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth", "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"]
  max_session_duration = "3600"
  name                 = "aws-elasticbeanstalk-service-role"
  path                 = "/"
}

resource "aws_iam_role" "tfer--aws-quicksight-service-role-v0" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "quicksight.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/AWSQuickSightIAMPolicy", "arn:aws:iam::894231352815:policy/service-role/AWSQuickSightRDSPolicy", "arn:aws:iam::894231352815:policy/service-role/AWSQuickSightRedshiftPolicy"]
  max_session_duration = "3600"
  name                 = "aws-quicksight-service-role-v0"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-Arclight-QA-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-Arclight-QA-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-Arclight-QA-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-admin-preprod-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-admin-preprod-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-admin-preprod-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-admin-prod-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-admin-prod-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-admin-prod-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-admin-qa-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-admin-qa-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-admin-qa-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-api-preprod-admin-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-preprod-admin-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-api-preprod-admin-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-api-preprod-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-preprod-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-api-preprod-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-api-prod-admin-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-prod-admin-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-api-prod-admin-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-api-prod-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-prod-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-api-prod-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-api-qa-servicerole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-qa-import-us-east-1", "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-qa-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-api-qa-servicerole"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-import-preprod-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-import-preprod-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-import-preprod-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-import-prod-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-import-prod-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-import-prod-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--codebuild-import-qa-service-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-import-qa-us-east-1"]
  max_session_duration = "3600"
  name                 = "codebuild-import-qa-service-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--core-apollo-gateway" {
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

  description          = "Allows apollo gateway instance to access S3 bucket for code assets."
  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/core-apollo-gateway"]
  max_session_duration = "3600"
  name                 = "core-apollo-gateway"
  path                 = "/"
}

resource "aws_iam_role" "tfer--couchbase_firehose_delivery_role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "894231352815"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Service": "firehose.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "couchbase_firehose_delivery_policy"
    policy = "{\n    \"Version\": \"2012-10-17\",\n    \"Statement\": [\n        {\n            \"Sid\": \"\",\n            \"Effect\": \"Allow\",\n            \"Action\": [\n                \"s3:AbortMultipartUpload\",\n                \"s3:GetBucketLocation\",\n                \"s3:GetObject\",\n                \"s3:ListBucket\",\n                \"s3:ListBucketMultipartUploads\",\n                \"s3:PutObject\"\n            ],\n            \"Resource\": [\n                \"arn:aws:s3:::arclight-es-logs\",\n                \"arn:aws:s3:::arclight-es-logs/*\"\n            ]\n        },\n        {\n            \"Sid\": \"\",\n            \"Effect\": \"Allow\",\n            \"Action\": [\n                \"lambda:InvokeFunction\",\n                \"lambda:GetFunctionConfiguration\"\n            ],\n            \"Resource\": [\n                \"arn:aws:lambda:us-east-1:894231352815:function:couchbase-ingest-cluster-stats:$LATEST\",\n                \"arn:aws:lambda:us-east-1:894231352815:function:nexus-arclight-org-access:$LATEST\",\n                \"arn:aws:lambda:us-east-1:894231352815:function:nexus-arclight-org:$LATEST\",\n                \"arn:aws:lambda:us-east-1:894231352815:function:pl-arc-gt-access:$LATEST\"\n            ]\n        },\n        {\n            \"Sid\": \"\",\n            \"Effect\": \"Allow\",\n            \"Action\": [\n                \"es:DescribeElasticsearchDomain\",\n                \"es:DescribeElasticsearchDomains\",\n                \"es:DescribeElasticsearchDomainConfig\",\n                \"es:ESHttpPost\",\n                \"es:ESHttpPut\"\n            ],\n            \"Resource\": [\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/*\"\n            ]\n        },\n        {\n            \"Sid\": \"\",\n            \"Effect\": \"Allow\",\n            \"Action\": [\n                \"es:ESHttpGet\"\n            ],\n            \"Resource\": [\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/_all/_settings\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/_cluster/stats\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/_nodes\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/_nodes/stats\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/_nodes/*/stats\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/_stats\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/couchbase*/_mapping/cluster-stats\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/couchbase*/_stats\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/nginx*/_mapping/nginx.access\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/nginx*/_stats\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/nexus*/_mapping/nexus\",\n                \"arn:aws:es:us-east-1:894231352815:domain/arclight-es/nexus*/_stats\"\n            ]\n        },\n        {\n            \"Sid\": \"\",\n            \"Effect\": \"Allow\",\n            \"Action\": [\n                \"logs:PutLogEvents\"\n            ],\n            \"Resource\": [\n                \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/couchbase-stats:log-stream:*\",\n                \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/nexus.arclight.org.access.stream:log-stream:*\",\n                \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/nexus.arclight.org.stream:log-stream:*\",\n                \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/pl.arc.gt.access.stream:log-stream:*\"\n            ]\n        }\n    ]\n}"
  }

  max_session_duration = "3600"
  name                 = "couchbase_firehose_delivery_role"
  path                 = "/"
}

resource "aws_iam_role" "tfer--cwe-role-us-east-1-arclight-api-qa" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "events.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/start-pipeline-execution-us-east-1-arclight-api-qa"]
  max_session_duration = "3600"
  name                 = "cwe-role-us-east-1-arclight-api-qa"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--datainsightsProcessFirstPartyYoutubeChannels-role-xhga0n88" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-6d83a4c4-b877-4b62-9cb5-a630e787e5bb"]
  max_session_duration = "3600"
  name                 = "datainsightsProcessFirstPartyYoutubeChannels-role-xhga0n88"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--ecsAutoscaleRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "application-autoscaling.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceAutoscaleRole"]
  max_session_duration = "3600"
  name                 = "ecsAutoscaleRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--ecsEventsRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "events.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole"]
  max_session_duration = "3600"
  name                 = "ecsEventsRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--ecsInstanceRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2008-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"]
  max_session_duration = "3600"
  name                 = "ecsInstanceRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--ecsServiceRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2008-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole"]
  max_session_duration = "3600"
  name                 = "ecsServiceRole"
  path                 = "/"
}

resource "aws_iam_role" "tfer--ecsTaskExecutionRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2008-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"]
  max_session_duration = "3600"
  name                 = "ecsTaskExecutionRole"
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

resource "aws_iam_role" "tfer--es-media-components-role-wimvjjup" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-d4fbe891-3a27-4670-a527-be33723b4dcc"]
  max_session_duration = "3600"
  name                 = "es-media-components-role-wimvjjup"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--firehose_delivery_role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "894231352815"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Service": "firehose.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "oneClick_firehose_delivery_role_1461869011040"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:AbortMultipartUpload\",\n        \"s3:GetBucketLocation\",\n        \"s3:GetObject\",\n        \"s3:ListBucket\",\n        \"s3:ListBucketMultipartUploads\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::JFP_DW_Dev\",\n        \"arn:aws:s3:::JFP_DW_Dev/*\"\n      ]\n    },\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": [\n        \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/tracker_poc_custom:log-stream:*\"\n      ]\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_firehose_delivery_role_1467752139775"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:AbortMultipartUpload\",\n        \"s3:GetBucketLocation\",\n        \"s3:GetObject\",\n        \"s3:ListBucket\",\n        \"s3:ListBucketMultipartUploads\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::JFP_DW_Prod\",\n        \"arn:aws:s3:::JFP_DW_Prod/*\"\n      ]\n    },\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": [\n        \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/prod_events:log-stream:*\"\n      ]\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_firehose_delivery_role_1469827607528"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:AbortMultipartUpload\",\n        \"s3:GetBucketLocation\",\n        \"s3:GetObject\",\n        \"s3:ListBucket\",\n        \"s3:ListBucketMultipartUploads\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::jfp-me2-events-prod\",\n        \"arn:aws:s3:::jfp-me2-events-prod/*\"\n      ]\n    },\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": [\n        \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-prod-play:log-stream:*\"\n      ]\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_firehose_delivery_role_1469827923540"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:AbortMultipartUpload\",\n        \"s3:GetBucketLocation\",\n        \"s3:GetObject\",\n        \"s3:ListBucket\",\n        \"s3:ListBucketMultipartUploads\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::jfp-me2-events-prod\",\n        \"arn:aws:s3:::jfp-me2-events-prod/*\"\n      ]\n    },\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": [\n        \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-prod-share:log-stream:*\"\n      ]\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_firehose_delivery_role_1469828041591"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:AbortMultipartUpload\",\n        \"s3:GetBucketLocation\",\n        \"s3:GetObject\",\n        \"s3:ListBucket\",\n        \"s3:ListBucketMultipartUploads\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::jfp-me2-events-prod\",\n        \"arn:aws:s3:::jfp-me2-events-prod/*\"\n      ]\n    },\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": [\n        \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-prod-error:log-stream:*\"\n      ]\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_firehose_delivery_role_1469828125493"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:AbortMultipartUpload\",\n        \"s3:GetBucketLocation\",\n        \"s3:GetObject\",\n        \"s3:ListBucket\",\n        \"s3:ListBucketMultipartUploads\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::jfp-me2-events-stage\",\n        \"arn:aws:s3:::jfp-me2-events-stage/*\"\n      ]\n    },\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": [\n        \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-stage-play:log-stream:*\"\n      ]\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_firehose_delivery_role_1469828219712"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:AbortMultipartUpload\",\n        \"s3:GetBucketLocation\",\n        \"s3:GetObject\",\n        \"s3:ListBucket\",\n        \"s3:ListBucketMultipartUploads\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::jfp-me2-events-stage\",\n        \"arn:aws:s3:::jfp-me2-events-stage/*\"\n      ]\n    },\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": [\n        \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-stage-share:log-stream:*\"\n      ]\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_firehose_delivery_role_1469828316595"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:AbortMultipartUpload\",\n        \"s3:GetBucketLocation\",\n        \"s3:GetObject\",\n        \"s3:ListBucket\",\n        \"s3:ListBucketMultipartUploads\",\n        \"s3:PutObject\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::jfp-me2-events-stage\",\n        \"arn:aws:s3:::jfp-me2-events-stage/*\"\n      ]\n    },\n    {\n      \"Sid\": \"\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": [\n        \"arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-stage-error:log-stream:*\"\n      ]\n    }\n  ]\n}"
  }

  max_session_duration = "3600"
  name                 = "firehose_delivery_role"
  path                 = "/"
}

resource "aws_iam_role" "tfer--lambda-bizrules-testing" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/lambda_to_sns_me2transcheck", "arn:aws:iam::aws:policy/AmazonSNSFullAccess", "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole", "arn:aws:iam::aws:policy/service-role/AmazonSNSRole"]
  max_session_duration = "3600"
  name                 = "lambda-bizrules-testing"
  path                 = "/"
}

resource "aws_iam_role" "tfer--lambda-kinesis-execution-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AWSLambdaKinesisExecutionRole"]
  max_session_duration = "3600"
  name                 = "lambda-kinesis-execution-role"
  path                 = "/"
}

resource "aws_iam_role" "tfer--lambda_basic_execution" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "oneClick_lambda_basic_execution_1464814276130"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:CreateLogGroup\",\n        \"logs:CreateLogStream\",\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": \"arn:aws:logs:*:*:*\"\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_lambda_basic_execution_1466875087844"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:CreateLogGroup\",\n        \"logs:CreateLogStream\",\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": \"arn:aws:logs:*:*:*\"\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_lambda_basic_execution_1467668823983"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:CreateLogGroup\",\n        \"logs:CreateLogStream\",\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": \"arn:aws:logs:*:*:*\"\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_lambda_basic_execution_1467818312602"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:CreateLogGroup\",\n        \"logs:CreateLogStream\",\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": \"arn:aws:logs:*:*:*\"\n    }\n  ]\n}"
  }

  managed_policy_arns  = ["arn:aws:iam::aws:policy/AWSLambdaFullAccess", "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"]
  max_session_duration = "3600"
  name                 = "lambda_basic_execution"
  path                 = "/"
}

resource "aws_iam_role" "tfer--lambda_basic_vpc_execution" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "oneClick_lambda_basic_vpc_execution_1465485162643"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"logs:CreateLogGroup\",\n        \"logs:CreateLogStream\",\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": \"arn:aws:logs:*:*:*\"\n    },\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"ec2:CreateNetworkInterface\",\n        \"ec2:DescribeNetworkInterfaces\",\n        \"ec2:DetachNetworkInterface\",\n        \"ec2:DeleteNetworkInterface\"\n      ],\n      \"Resource\": \"*\"\n    }\n  ]\n}"
  }

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/lambda_to_sns_me2transcheck", "arn:aws:iam::aws:policy/AmazonSNSFullAccess"]
  max_session_duration = "3600"
  name                 = "lambda_basic_vpc_execution"
  path                 = "/"
}

resource "aws_iam_role" "tfer--lambda_plumber_role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "oneClick_lambda_basic_execution_1467819001540"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"lambda:InvokeFunction\"\n      ],\n      \"Resource\": [\n        \"*\"\n      ]\n    },\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"kinesis:GetRecords\",\n        \"kinesis:GetShardIterator\",\n        \"kinesis:DescribeStream\",\n        \"kinesis:ListStreams\",\n        \"logs:CreateLogGroup\",\n        \"logs:CreateLogStream\",\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": \"*\"\n    }\n  ]\n}"
  }

  inline_policy {
    name   = "oneClick_lambda_plumber_role_1467819208256"
    policy = "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"lambda:InvokeFunction\"\n      ],\n      \"Resource\": [\n        \"*\"\n      ]\n    },\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"kinesis:GetRecords\",\n        \"kinesis:GetShardIterator\",\n        \"kinesis:DescribeStream\",\n        \"kinesis:ListStreams\",\n        \"logs:CreateLogGroup\",\n        \"logs:CreateLogStream\",\n        \"logs:PutLogEvents\"\n      ],\n      \"Resource\": \"*\"\n    }\n  ]\n}"
  }

  managed_policy_arns  = ["arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess", "arn:aws:iam::aws:policy/AmazonKinesisFullAccess"]
  max_session_duration = "3600"
  name                 = "lambda_plumber_role"
  path                 = "/"
}

resource "aws_iam_role" "tfer--lambda_refresh_api_keys_role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/AWSLambdaFullAccess", "arn:aws:iam::aws:policy/AmazonSNSFullAccess"]
  max_session_duration = "3600"
  name                 = "lambda_refresh_api_keys_role"
  path                 = "/"
}

resource "aws_iam_role" "tfer--lambda_tim_005" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/AWSLambdaExecute", "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"]
  max_session_duration = "3600"
  name                 = "lambda_tim_005"
  path                 = "/"
}

resource "aws_iam_role" "tfer--me2-ingest-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-55127d15-5bf9-429a-9ea4-b8809b0766a2", "arn:aws:iam::aws:policy/AmazonKinesisFirehoseFullAccess"]
  max_session_duration = "3600"
  name                 = "me2-ingest-role"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--rds-monitoring-role" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "monitoring.rds.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"]
  max_session_duration = "3600"
  name                 = "rds-monitoring-role"
  path                 = "/"
}

resource "aws_iam_role" "tfer--sean-dev-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "sean-dev-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/sean-dev*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/sean-dev*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  max_session_duration = "3600"
  name                 = "sean-dev-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "dev"
  }

  tags_all = {
    STAGE = "dev"
  }
}

resource "aws_iam_role" "tfer--test-bogus-totally-bogus-dev-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "test-bogus-totally-bogus-dev-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/test-bogus-totally-bogus-dev*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/test-bogus-totally-bogus-dev*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  max_session_duration = "3600"
  name                 = "test-bogus-totally-bogus-dev-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "dev"
  }

  tags_all = {
    STAGE = "dev"
  }
}

resource "aws_iam_role" "tfer--test-dev-us-east-1-lambdaRole" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  inline_policy {
    name   = "test-dev-lambda"
    policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"logs:CreateLogStream\",\"logs:CreateLogGroup\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/test-dev*:*\"],\"Effect\":\"Allow\"},{\"Action\":[\"logs:PutLogEvents\"],\"Resource\":[\"arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/test-dev*:*:*\"],\"Effect\":\"Allow\"}]}"
  }

  max_session_duration = "3600"
  name                 = "test-dev-us-east-1-lambdaRole"
  path                 = "/"

  tags = {
    STAGE = "dev"
  }

  tags_all = {
    STAGE = "dev"
  }
}

resource "aws_iam_role" "tfer--testFunFun-role-yvq06kzv" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-0222a08b-9a31-4607-a110-9f61b66211da"]
  max_session_duration = "3600"
  name                 = "testFunFun-role-yvq06kzv"
  path                 = "/service-role/"
}

resource "aws_iam_role" "tfer--wp-graphql-request-role-07aktf4v" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-6e60b8f9-2dd0-4e7d-bed3-cf50af182f8b"]
  max_session_duration = "3600"
  name                 = "wp-graphql-request-role-07aktf4v"
  path                 = "/service-role/"
}
