module "ecs-task" {
  source                         = "../../../infrastructure/modules/aws/ecs-scheduled-task"
  cloudwatch_schedule_expression = "cron(0 0,4,8,12,16,20 * * ? *)"
  task_execution_role_arn        = var.task_execution_role_arn
  subnet_ids                     = var.subnet_ids
  task_name                      = "arangodb-bigquery-etl"
  doppler_token                  = var.doppler_token
  cluster_arn                    = var.cluster_arn
  env                            = "prod"
  task_memory                    = 2048
  environment_variables = [
    "DATABASE_DB",
    "DATABASE_PASS",
    "DATABASE_URL",
    "DATABASE_USER",
    "GCLOUD",
  ]
}
