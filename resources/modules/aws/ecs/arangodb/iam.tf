data "aws_iam_policy_document" "assume_task_document" {
  statement {
    # Allows the role to be assumed by ECS Task
    sid    = ""
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
  name               = "${local.name}-TaskRole"
  description        = "Task Role for ${var.identifier} (${var.env})."
  assume_role_policy = data.aws_iam_policy_document.assume_task_document.json
  tags               = local.tags
}

resource "aws_iam_role" "task_execution_role" {
  name               = "${local.name}-TaskExecutionRole"
  description        = "Task Execution Role for ${var.identifier} (${var.env})."
  assume_role_policy = data.aws_iam_policy_document.assume_task_execution_document.json
  tags               = local.tags
}

data "aws_iam_policy_document" "assume_task_execution_document" {
  statement {
    # Allows role to be assumed by ECS
    sid    = ""
    effect = "Allow"
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

resource "aws_iam_role_policy" "password_policy_parameterstore" {
  name = "password-policy-parameterstore"
  role = aws_iam_role.task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
        Action = ["ssm:GetParameters"]
        Effect = "Allow"
        Resource = [
          for param in aws_ssm_parameter.parameters: "${param.arn}"
        ]
      }
    ]
  })
}