locals {
  ecs_task_definition_family = "${var.service_config.name}-${var.env}"
}
