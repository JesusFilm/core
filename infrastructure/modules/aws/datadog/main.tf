data "aws_iam_policy_document" "datadog_aws_integration_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::464622532012:root"]
    }
    condition {
      test     = "StringEquals"
      variable = "sts:ExternalId"

      values = [
        "${datadog_integration_aws.sandbox.external_id}"
      ]
    }
  }
}

data "aws_iam_policy_document" "datadog_aws_integration" {
  statement {
    actions = [
      "apigateway:GET",
      "autoscaling:Describe*",
      "backup:List*",
      "budgets:ViewBudget",
      "cloudfront:GetDistributionConfig",
      "cloudfront:ListDistributions",
      "cloudtrail:DescribeTrails",
      "cloudtrail:GetTrailStatus",
      "cloudtrail:LookupEvents",
      "cloudwatch:Describe*",
      "cloudwatch:Get*",
      "cloudwatch:List*",
      "codedeploy:List*",
      "codedeploy:BatchGet*",
      "directconnect:Describe*",
      "dynamodb:List*",
      "dynamodb:Describe*",
      "ec2:Describe*",
      "ecs:Describe*",
      "ecs:List*",
      "elasticache:Describe*",
      "elasticache:List*",
      "elasticfilesystem:DescribeFileSystems",
      "elasticfilesystem:DescribeTags",
      "elasticfilesystem:DescribeAccessPoints",
      "elasticloadbalancing:Describe*",
      "elasticmapreduce:List*",
      "elasticmapreduce:Describe*",
      "es:ListTags",
      "es:ListDomainNames",
      "es:DescribeElasticsearchDomains",
      "events:CreateEventBus",
      "fsx:DescribeFileSystems",
      "fsx:ListTagsForResource",
      "health:DescribeEvents",
      "health:DescribeEventDetails",
      "health:DescribeAffectedEntities",
      "kinesis:List*",
      "kinesis:Describe*",
      "lambda:GetPolicy",
      "lambda:List*",
      "logs:DeleteSubscriptionFilter",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:DescribeSubscriptionFilters",
      "logs:FilterLogEvents",
      "logs:PutSubscriptionFilter",
      "logs:TestMetricFilter",
      "organizations:Describe*",
      "organizations:List*",
      "rds:Describe*",
      "rds:List*",
      "redshift:DescribeClusters",
      "redshift:DescribeLoggingStatus",
      "route53:List*",
      "s3:GetBucketLogging",
      "s3:GetBucketLocation",
      "s3:GetBucketNotification",
      "s3:GetBucketTagging",
      "s3:ListAllMyBuckets",
      "s3:PutBucketNotification",
      "ses:Get*",
      "sns:List*",
      "sns:Publish",
      "sqs:ListQueues",
      "states:ListStateMachines",
      "states:DescribeStateMachine",
      "support:DescribeTrustedAdvisor*",
      "support:RefreshTrustedAdvisorCheck",
      "tag:GetResources",
      "tag:GetTagKeys",
      "tag:GetTagValues",
      "xray:BatchGetTraces",
      "xray:GetTraceSummaries"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "datadog_aws_integration" {
  name   = "DatadogAWSIntegrationPolicy"
  policy = data.aws_iam_policy_document.datadog_aws_integration.json
}

resource "aws_iam_role" "datadog_aws_integration" {
  name               = "DatadogAWSIntegrationRole"
  description        = "Role for Datadog AWS Integration"
  assume_role_policy = data.aws_iam_policy_document.datadog_aws_integration_assume_role.json
}

resource "aws_iam_role_policy_attachment" "datadog_aws_integration" {
  role       = aws_iam_role.datadog_aws_integration.name
  policy_arn = aws_iam_policy.datadog_aws_integration.arn
}

resource "datadog_integration_aws" "sandbox" {
  account_id = data.aws_caller_identity.current.account_id
  role_name  = "DatadogAWSIntegrationRole"
}

module "datadog_log_forwarder" {
  source     = "terraform-aws-modules/datadog-forwarders/aws//modules/log_forwarder"
  version    = "5.1.0"
  dd_api_key = data.aws_ssm_parameter.datadog_api_key.value

}

module "datadog_rds_enhanced_monitoring_forwarder" {
  source     = "terraform-aws-modules/datadog-forwarders/aws//modules/rds_enhanced_monitoring_forwarder"
  version    = "5.1.0"
  dd_api_key = data.aws_ssm_parameter.datadog_api_key.value
}

# Grant the Datadog forwarder Lambda role permission to read ALB logs from S3
data "aws_iam_role" "datadog_log_forwarder" {
  name = "datadog-log-forwarder"
}

locals {
  account_id = data.aws_caller_identity.current.account_id
  s3_read_resources = [
    # Stage buckets
    "arn:aws:s3:::jfp-public-alb-logs-stage-${local.account_id}",
    "arn:aws:s3:::jfp-public-alb-logs-stage-${local.account_id}/AWSLogs/${local.account_id}/*",
    "arn:aws:s3:::jfp-internal-alb-logs-stage-${local.account_id}",
    "arn:aws:s3:::jfp-internal-alb-logs-stage-${local.account_id}/AWSLogs/${local.account_id}/*",
    # Prod buckets
    "arn:aws:s3:::jfp-public-alb-logs-prod-${local.account_id}",
    "arn:aws:s3:::jfp-public-alb-logs-prod-${local.account_id}/AWSLogs/${local.account_id}/*",
    "arn:aws:s3:::jfp-internal-alb-logs-prod-${local.account_id}",
    "arn:aws:s3:::jfp-internal-alb-logs-prod-${local.account_id}/AWSLogs/${local.account_id}/*",
  ]
}

resource "aws_iam_policy" "datadog_forwarder_s3_read" {
  name        = "DatadogForwarderS3Read"
  description = "Allow Datadog forwarder to read ALB access logs from S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3ListBuckets"
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::jfp-public-alb-logs-stage-${local.account_id}",
          "arn:aws:s3:::jfp-internal-alb-logs-stage-${local.account_id}",
          "arn:aws:s3:::jfp-public-alb-logs-prod-${local.account_id}",
          "arn:aws:s3:::jfp-internal-alb-logs-prod-${local.account_id}"
        ]
      },
      {
        Sid    = "S3GetObjects"
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = [
          "arn:aws:s3:::jfp-public-alb-logs-stage-${local.account_id}/AWSLogs/${local.account_id}/*",
          "arn:aws:s3:::jfp-internal-alb-logs-stage-${local.account_id}/AWSLogs/${local.account_id}/*",
          "arn:aws:s3:::jfp-public-alb-logs-prod-${local.account_id}/AWSLogs/${local.account_id}/*",
          "arn:aws:s3:::jfp-internal-alb-logs-prod-${local.account_id}/AWSLogs/${local.account_id}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "datadog_forwarder_s3_read" {
  role       = data.aws_iam_role.datadog_log_forwarder.name
  policy_arn = aws_iam_policy.datadog_forwarder_s3_read.arn
}
