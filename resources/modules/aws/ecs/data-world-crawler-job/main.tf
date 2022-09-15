data "aws_ecs_cluster" "cluster" {
  cluster_name = var.env
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

data "aws_vpc" "main" {
  filter {
    name   = "tag:env"
    values = ["prod"]
  }
}

data "aws_subnets" "app_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  tags = {
    env  = "prod"
    type = "apps"
  }
}

locals {

  commonLogConfiguration = {
    logDriver = "awsfirelens"
    secretOptions = [{
      name      = "apikey"
      valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/data-world-crawler/datadog-api-key"
    }]
  }

  commonLogOptions = {
    Name           = "datadog"
    Host           = "http-intake.logs.datadoghq.com"
    dd_message_key = "log"
    dd_tags        = "env:${var.env},application:${var.identifier},integration:data-world"
    TLS            = "on"
    compress       = "gzip"
    provider       = "ecs"
  }

  dwc_tag = "1.0.0"

  credentials_path_parent = "/data-world-crawler/${var.credentials_identifier != "" ? var.credentials_identifier : var.identifier}/${var.env}"
}

data "aws_ecr_repository" "collector_repo" {
  name = "data-world-crawler-extended-collector"
}

data "aws_ecr_repository" "uploader_repo" {
  name = "data-world-crawler-uploader"
}

module "ecs_scheduled_task" {
  source = "git::https://github.com/CruGlobal/terraform-aws-ecs-scheduled-task.git?ref=add-volumes"

  name        = "${var.identifier}-${var.env}-data-world-crawler"
  description = "An executable example demonstrating a periodic data.world crawler job"

  schedule_expression = var.schedule_expression

  cluster_arn = data.aws_ecs_cluster.cluster.arn
  subnets     = data.aws_subnets.app_subnets.ids

  security_groups = []
  cpu             = 256
  memory          = 512
  iam_path        = "/data-world-crawler/"

  container_definitions = jsonencode([
    {
      name      = "collector"
      image     = "${data.aws_ecr_repository.collector_repo.repository_url}:${local.dwc_tag}"
      essential = false

      environment = [
        for key, value in merge({
          DWCC_COMMAND    = "catalog-${var.database_type}"
          COLLECTION_NAME = var.collection_name
          ACCOUNT         = var.org_name
          }, var.database_type == "bigquery" ? {
          DATASET = var.dataset
          PROJECT = var.project_id
          } : {
          DATABASE = var.database != "" ? var.database : var.identifier
          SERVER   = var.host
          SCHEMA   = var.schema
          USER     = "intf_dataworld"
          }) : {
          name  = key,
          value = value
        }
      ]

      secrets = [
        var.database_type == "bigquery" ? {
          name      = "CREDENTIAL_FILE_CONTENTS"
          valueFrom = "${local.credentials_path_parent}/CREDENTIAL_FILE_CONTENTS"
          } : {
          name      = "PASSWORD"
          valueFrom = "${local.credentials_path_parent}/PASSWORD"
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "output"
          containerPath = "/dwcc-output",
        },
        {
          sourceVolume  = "logs"
          containerPath = "/app/log",
        }
      ]

      logConfiguration = merge({
        options = merge({
          dd_service = "dwc-collector"
          dd_source  = "java"
        }, local.commonLogOptions),
      }, local.commonLogConfiguration)

      # These are optional, but can't be 'null' otherwise terraform always sees a dirty plan
      cpu          = 0
      portMappings = []
      volumesFrom  = []
    },
    {
      name      = "uploader"
      image     = "${data.aws_ecr_repository.uploader_repo.repository_url}:${local.dwc_tag}"
      essential = true

      environment = [
        for key, value in {
          DATASET_OWNER = var.org_name
          DATASET_ID    = "ddw-catalogs"
          } : {
          name  = key,
          value = value
        }
      ]

      secrets = [
        {
          name      = "DATA_WORLD_API_TOKEN"
          valueFrom = "/data-world-crawler/${var.env}/data-world-api-key"
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "output"
          containerPath = "/collector-output",
          readOnly      = true
        },
        {
          sourceVolume  = "logs"
          containerPath = "/collector-logs",
          readOnly      = true
        }
      ]

      logConfiguration = merge({
        options = merge({
          dd_service = "dwc-uploader"
          dd_source  = "bash"
        }, local.commonLogOptions),
      }, local.commonLogConfiguration)

      # These are optional, but can't be 'null' otherwise terraform always sees a dirty plan
      cpu          = 0
      portMappings = []
      volumesFrom  = []
    },
    {
      name      = "log_router",
      essential = true,

      # Note: only works for some regions (including all standard US regions); see table at
      # https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_firelens.html#firelens-using-fluentbit
      image = "906394416424.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/aws-for-fluent-bit:latest",

      firelensConfiguration = {
        type = "fluentbit",
        options = {
          "enable-ecs-log-metadata" = "true"
        }
      }

      # These are optional, but can't be 'null' otherwise terraform always sees a dirty plan
      environment  = []
      cpu          = 0
      mountPoints  = []
      portMappings = []
      volumesFrom  = []

      # On this container, ECS decides to make the user root, for some reason
      user = "0"
    }
  ])

  volumes = [
    {
      name = "logs"
    },
    {
      name = "output"
    }
  ]

  tags = {
    env         = var.env
    application = "data-world"
    managed_by  = "terraform"
  }
}

resource "aws_iam_role_policy" "task_execution_policy" {
  name   = "${var.identifier}-${var.env}-TaskExecutionPolicy"
  role   = module.ecs_scheduled_task.ecs_task_execution_role_name
  policy = data.aws_iam_policy_document.task_execution_policy_document.json
}

data "aws_iam_policy_document" "task_execution_policy_document" {
  statement {
    # Allows role to get ssm parameters by name and path
    sid    = "AllowGetParameters"
    effect = "Allow"
    actions = [
      "ssm:GetParametersByPath",
      "ssm:GetParameters"
    ]
    resources = [
      "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/data-world-crawler/datadog-api-key",
      "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/data-world-crawler/${var.env}/data-world-api-key",
      "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter${local.credentials_path_parent}/*"
    ]
  }
}
