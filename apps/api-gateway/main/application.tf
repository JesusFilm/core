# module "api_gateway" {
#   source = "../../../resources/modules/aws/ecs/app"

#   identifier           = local.identifier
#   env                  = local.env
#   contact_email        = local.tags.owner
#   zone_id              = data.aws_route53_zone.central_jesusfilm_org.zone_id
#   extra_tags           = local.tags
#   # developers           = local.developers
#   load_balancer_arn    = aws_lb.application_load_balancer.arn
#   create_target_group  = false
#   create_listener_rule = false
#   target_group_arn     = aws_lb_target_group.target_group.arn
#   # maintenance_db_index = -1

#   # task_policy_override_json   = data.aws_iam_policy_document.atlantis_write_access.json
#   # additional_task_policy_arns = ["arn:aws:iam::aws:policy/ReadOnlyAccess"]

#   task_names = ["app"]
#   services = [{
#     name               = "app"
#     launch_type        = "FARGATE"
#     desired_count      = "1"
#     # log_dd_source      = "node"
#     # memory             = "512"
#     # memory_reservation = "256"
#     # cpu                = "256"
#     container_port     = "4000"
#     host_port          = "4000"
#     network_mode       = "awsvpc"
    
#     container_definitions = [{
#       image = "${data.aws_ecr_repository.main.repository_url}/${data.aws_ecr_repository.main.name}:${local.env}"
#     }]
#     # network_configuration = jsonencode({
#     #   subnets         = data.aws_subnets.main_public.ids
#     #   # security_groups = [module.atlantis_sg.security_group_id]
#     # })
#   }]
# }



























# resource "aws_appautoscaling_target" "ecs_target" {
#   max_capacity       = 6
#   min_capacity       = 1
#   resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_cluster.main.name}"
#   scalable_dimension = "ecs:service:DesiredCount"
#   service_namespace  = "ecs"
# }