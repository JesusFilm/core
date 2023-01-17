locals {
  service_config_name_env    = "faktory-${var.env}"
  ecs_task_definition_family = "jfp-${local.service_config_name_env}"
}
