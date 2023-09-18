locals {
  service_config_name_env    = "${var.task_name}-${var.env}"
  ecs_task_definition_family = "jfp-${local.service_config_name_env}"
}
