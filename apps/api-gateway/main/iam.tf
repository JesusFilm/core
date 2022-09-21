data "aws_iam_policy_document" "task_execution_policy_document" {
  # override_policy_documents = [var.task_execution_policy_override_json]
  statement {
    # Allows role to get ssm parameters by name and path
    sid    = "AllowGetParameters"
    effect = "Allow"
    actions = [
      "ssm:GetParametersByPath",
      "ssm:GetParameters"
    ]
    resources = [
      "arn:aws:ssm:us-east-2:${data.aws_caller_identity.current.account_id}:parameter/ecs/${local.identifier}/${local.env}/*",
      "arn:aws:ssm:us-east-2:${data.aws_caller_identity.current.account_id}:parameter/shared/${local.env}/*"
    ]
  }
}

data "aws_iam_policy_document" "assume_task_document" {
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
  # TODO: fix github implementation
  # statement {
  #   # Allow the role to be assumed by GitHub Actions from the application repo
  #   sid     = "AllowGitHubToAssumeRole"
  #   effect  = "Allow"
  #   actions = ["sts:AssumeRoleWithWebIdentity"]
  #   principals {
  #     identifiers = [data.terraform_remote_state.github_oidc.outputs.github_oidc_arn]
  #     type        = "Federated"
  #   }
  #   condition {
  #     test     = "StringLike"
  #     values   = ["repo:${data.github_repository.repo.full_name}:*"]
  #     variable = "${data.terraform_remote_state.github_oidc.outputs.github_provider_hostname}:sub"
  #   }
  # }
}

resource "aws_iam_role" "task_role" {
  name               = "${local.identifier}-${local.env}-TaskRole"
  description        = "Task Role for ${local.identifier} (${local.env})."
  assume_role_policy = data.aws_iam_policy_document.assume_task_document.json
  tags               = local.tags
}

resource "aws_iam_role" "task_execution_role" {
  name               = "${local.identifier}-${local.env}-TaskExecutionRole"
  description        = "Task Execution Role for ${local.identifier} (${local.env})."
  assume_role_policy = data.aws_iam_policy_document.assume_task_execution_document.json
  tags               = local.tags
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
}

resource "aws_iam_role_policy_attachment" "task_execution_role_can_execute_ecs_task" {
  role       = aws_iam_role.task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "task_execution_policy" {
  name   = "${local.identifier}-${local.env}-TaskExecutionPolicy"
  role   = aws_iam_role.task_execution_role.id
  policy = data.aws_iam_policy_document.task_execution_policy_document.json
}