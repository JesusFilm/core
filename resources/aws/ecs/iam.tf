############
# IAM Role
############

data "aws_iam_policy_document" "ecs_events_role" {
  statement {
    principals {
      identifiers = ["events.amazonaws.com"]
      type        = "Service"
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ecsEventsRole" {
  name               = "ecsEventsRole"
  description        = "CloudWatch Events service permissions to run Amazon ECS tasks on your behalf."
  assume_role_policy = data.aws_iam_policy_document.ecs_events_role.json
  tags               = local.tags
}

data "aws_iam_policy_document" "aws_service_role_for_application_auto_scaling_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs.application-autoscaling.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "aws_service_role_for_application_auto_scaling_ecs_service_role" {
  name               = "AWSServiceRoleForApplicationAutoScaling_ECSService"
  path               = "/aws-service-role/ecs.application-autoscaling.amazonaws.com/"
  assume_role_policy = data.aws_iam_policy_document.aws_service_role_for_application_auto_scaling_assume_role_policy.json
  # tags               = local.tags
}

data "aws_iam_policy" "aws_service_role_for_application_auto_scaling_ecs_service_policy" {
  arn = "arn:aws:iam::aws:policy/aws-service-role/AWSApplicationAutoscalingECSServicePolicy"
}

resource "aws_iam_role_policy_attachment" "aws_service_role_for_application_auto_scaling_ecs_service_policy_attach" {
  role       = aws_iam_role.aws_service_role_for_application_auto_scaling_ecs_service_role.name
  policy_arn = data.aws_iam_policy.aws_service_role_for_application_auto_scaling_ecs_service_policy.arn
}
############
# IAM Policy
############


resource "aws_iam_role_policy_attachment" "AmazonEC2ContainerServiceEventsRole-attach" {
  role       = aws_iam_role.ecsEventsRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole"
}

resource "aws_iam_policy" "AmazonECSEventsTaskExecutionRole" {
  name        = "AmazonECSEventsTaskExecutionRole"
  description = "Policy to enable CloudWatch Events"
  policy      = data.aws_iam_policy_document.ecs_tasks_execution.json
  # tags        = local.tags
}

data "aws_iam_policy_document" "ecs_tasks_execution" {
  statement {
    actions   = ["iam:PassRole"]
    resources = ["arn:aws:iam::410965620680:role/ecsTaskExecutionRole"]
  }
}

resource "aws_iam_role_policy_attachment" "AmazonECSEventsTaskExecutionRole-attach" {
  role       = aws_iam_role.ecsEventsRole.name
  policy_arn = aws_iam_policy.AmazonECSEventsTaskExecutionRole.arn
}
