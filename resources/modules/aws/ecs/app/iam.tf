###############################################
# Task Execution Role and Policies - Used by ECS to run the service/task
###############################################
resource "aws_iam_role" "task_execution_role" {
  name               = "${local.name}-TaskExecutionRole"
  description        = "Task Execution Role for ${var.identifier} (${var.env})."
  assume_role_policy = data.aws_iam_policy_document.assume_task_execution_document.json
  tags               = local.tags
}

output "task_execution_role_arn" {
  description = "The task execution role ARN"
  value       = aws_iam_role.task_execution_role.arn
}

resource "aws_iam_role_policy_attachment" "task_execution_role_can_execute_ecs_task" {
  role       = aws_iam_role.task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "task_execution_role_can_execute_scheduled_task" {
  count = length(var.scheduled_tasks) == 0 ? 0 : 1

  role       = aws_iam_role.task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole"
}

resource "aws_iam_role_policy_attachment" "task_execution_policies" {
  count = length(var.additional_task_execution_policy_arns)

  role       = aws_iam_role.task_execution_role.name
  policy_arn = element(var.additional_task_execution_policy_arns, count.index)
}

resource "aws_iam_role_policy" "task_execution_policy" {
  name   = "${local.name}-TaskExecutionPolicy"
  role   = aws_iam_role.task_execution_role.id
  policy = data.aws_iam_policy_document.task_execution_policy_document.json
}

data "aws_iam_policy_document" "assume_task_execution_document" {
  statement {
    # Allows role to be assumed by ECS
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = [
      "sts:AssumeRole"
    ]
  }

  dynamic "statement" {
    for_each = length(var.scheduled_tasks) == 0 ? [] : [{}]
    content {
      # Allows role to be assumed by ECS
      principals {
        type        = "Service"
        identifiers = ["events.amazonaws.com"]
      }
      actions = [
        "sts:AssumeRole"
      ]
    }
  }
}

data "aws_iam_policy_document" "task_execution_policy_document" {
  override_policy_documents = [var.task_execution_policy_override_json]
  statement {
    # Allows role to get ssm parameters by name and path
    sid    = "AllowGetParameters"
    effect = "Allow"
    actions = [
      "ssm:GetParametersByPath",
      "ssm:GetParameters"
    ]
    resources = [
      "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/ecs/${var.identifier}/${var.env}/*",
      "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/shared/${var.env}/*"
    ]
  }
}

###############################################
# Task Role and Policies
###############################################
resource "aws_iam_role" "task_role" {
  name               = "${local.name}-TaskRole"
  description        = "Task Role for ${var.identifier} (${var.env})."
  assume_role_policy = data.aws_iam_policy_document.assume_task_document.json
  tags               = local.tags
}

output "task_role_arn" {
  description = "The task role ARN"
  value       = aws_iam_role.task_role.arn
}

output "task_role_unique_id" {
  description = "The task role unique_id"
  value       = aws_iam_role.task_role.unique_id
}

resource "aws_iam_role_policy" "task_policy" {
  name   = "${local.name}-TaskPolicy"
  role   = aws_iam_role.task_role.id
  policy = data.aws_iam_policy_document.task_policy_document.json
}

data "aws_iam_policy_document" "assume_task_document" {
  # Trust Policy JSON has max 2048 characters.
  override_policy_documents = [var.task_assume_role_policy_override_json]
  statement {
    # Allows the role to be assumed by ECS Task
    sid    = "AllowECSToAssumeRole"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
  statement {
    # Allow the role to be assumed by GitHub Actions from the application repo
    sid     = "AllowGitHubToAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      identifiers = [data.terraform_remote_state.github_oidc.outputs.github_oidc_arn]
      type        = "Federated"
    }
    condition {
      test     = "StringLike"
      values   = ["repo:${data.github_repository.repo.full_name}:*"]
      variable = "${data.terraform_remote_state.github_oidc.outputs.github_provider_hostname}:sub"
    }
  }
}

data "aws_iam_policy_document" "task_policy_document" {
  override_policy_documents = [var.task_policy_override_json]

  statement {
    # Allows the Task Role to admin SSM Parameters in the project namespace
    sid    = "AllowTaskRoleToAdminParameters"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParameterHistory",
      "ssm:GetParametersByPath",
      "ssm:PutParameter",
      "ssm:DeleteParameter",
      "ssm:DeleteParameters",
      "ssm:LabelParameterVersion",
      "ssm:AddTagsToResource",
      "ssm:ListTagsForResource",
      "ssm:RemoveTagsFromResource",
    ]
    resources = [
      "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/ecs/${var.identifier}/${var.env}/*"
    ]
  }

  statement {
    # Allows the Task Role to describe all SSM parameters.
    # - Needed for DescribeParameters with ParameterFilters
    sid       = "AllowTaskRoleToDescribeParameters"
    effect    = "Allow"
    actions   = ["ssm:DescribeParameters"]
    resources = ["arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*"]
  }

  statement {
    # Allows the Task Role to find AWS resources by Tag filters.
    # - Needed for ssm:DescribeParameters with ParameterFilters on Key=tag:Name
    sid       = "AllowTaskRoleToFilterResourcesOnTags"
    effect    = "Allow"
    actions   = ["tag:GetResources"]
    resources = ["*"]
  }

  statement {
    sid    = "AllowTaskRoleToAdminECR"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy",
      "ecr:DescribeRepositories",
      "ecr:ListImages",
      "ecr:DescribeImages",
      "ecr:BatchGetImage",
      "ecr:GetLifecyclePolicy",
      "ecr:GetLifecyclePolicyPreview",
      "ecr:ListTagsForResource",
      "ecr:DescribeImageScanFindings",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage"
    ]
    resources = ["arn:aws:ecr:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:repository/${var.identifier}"]
  }

  statement {
    sid       = "AllowTaskRoleDockerLoginToECR"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid       = "AllowTaskRoleToReadECSService"
    effect    = "Allow"
    actions   = ["ecs:DescribeServices"]
    resources = ["arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:service/${var.env}/${var.identifier}-*"]
  }

  statement {
    sid       = "AllowTaskRoleToListECSServices"
    effect    = "Allow"
    actions   = ["ecs:ListServices"]
    resources = ["*"]
  }

  statement {
    sid    = "AllowTaskRoleToReadWriteToSimpleDB"
    effect = "Allow"
    actions = [
      "sdb:GetAttributes",
      "sdb:PutAttributes"
    ]
    resources = ["arn:aws:sdb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/cruds-ecs-task-number"]
  }

  statement {
    sid       = "UpdateECSBuildNumber"
    effect    = "Allow"
    actions   = ["dynamodb:UpdateItem"]
    resources = [data.aws_dynamodb_table.build_numbers.arn]
  }
}

resource "aws_iam_role_policy_attachment" "task_policies" {
  count = length(var.additional_task_policy_arns)

  role       = aws_iam_role.task_role.name
  policy_arn = element(var.additional_task_policy_arns, count.index)
}
