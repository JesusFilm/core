# CloudWatch log group in us-east-1
resource "aws_cloudwatch_log_group" "route53_resolver_logging_main_vpc" {
  name              = "/aws/route53/resolver/logging/main-vpc"
  retention_in_days = 30
}

# CloudWatch log resource policy to allow Route53 to write logs
# to any log group under /aws/route53/*

data "aws_iam_policy_document" "route53-query-logging-policy" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:log-group:/aws/route53/*"]

    principals {
      identifiers = ["route53.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_cloudwatch_log_resource_policy" "route53-query-logging-policy" {
  policy_document = data.aws_iam_policy_document.route53-query-logging-policy.json
  policy_name     = "route53-query-logging-policy"
}

resource "aws_route53_resolver_query_log_config" "main_vpc" {
  name            = "main_vpc"
  destination_arn = aws_cloudwatch_log_group.route53_resolver_logging_main_vpc.arn

  tags = merge(local.tags, {
    comment = "Route53 DNS logging for our main vpc"
  })
}

resource "aws_route53_resolver_query_log_config_association" "logging_main_vpc_association" {
  resolver_query_log_config_id = aws_route53_resolver_query_log_config.main_vpc.id
  resource_id                  = data.aws_vpc.main.id
}