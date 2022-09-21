resource "aws_flow_log" "flow_log" {
  vpc_id       = aws_vpc.main.id
  traffic_type = "ALL"

  log_destination_type = "cloud-watch-logs"
  // log_destination      = aws_cloudwatch_log_group.flow_log.arn
  // log_group_name is deprecated in favor of using log_destination, but using it results in a forced replacement.
  log_group_name = aws_cloudwatch_log_group.flow_log.name
  log_format     = "$${version} $${account-id} $${interface-id} $${srcaddr} $${dstaddr} $${srcport} $${dstport} $${protocol} $${packets} $${bytes} $${start} $${end} $${action} $${log-status}"
  iam_role_arn   = aws_iam_role.flow_log_role.arn

  tags = merge(local.tags, {
    Name = "flowlog"
  })
}

resource "aws_cloudwatch_log_group" "flow_log" {
  name              = "flowlog"
  retention_in_days = 0 # Never Expire
  tags = merge(local.tags, {
    Name = "flowlog"
  })
}

resource "aws_iam_role" "flow_log_role" {
  name               = "flowlogsRole"
  description        = "Allows VPC Flow Log to write to CloudWatch log groups"
  assume_role_policy = data.aws_iam_policy_document.vpc_flow_logs_can_assume.json

  tags = local.tags
}

resource "aws_iam_role_policy" "flow_log_policy" {
  name   = "oneClick_flowlogsRole_1433988958397"
  role   = aws_iam_role.flow_log_role.id
  policy = data.aws_iam_policy_document.flow_log_policy_document.json
}

data "aws_iam_policy_document" "vpc_flow_logs_can_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["vpc-flow-logs.amazonaws.com"]
      type        = "Service"
    }
  }
}

data "aws_iam_policy_document" "flow_log_policy_document" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:GetLogEvents",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}