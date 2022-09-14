# data "aws_vpc" "main" {
#   tags = { Name = "Main VPC" }
# }

# #==============================
# # ECS Prod Instances
# #==============================

# resource "aws_security_group" "security_group" {
#   name        = "${local.identifier}-${local.env}-instances"
#   description = "ECS Host Instances (Prod)"
#   vpc_id      = data.aws_vpc.main.id
#   tags = {
#     function = local.identifier
#   }
# }

# #==============================
# # Applications ALB
# #==============================

# # Lookup Applications ALB security group
# data "aws_security_group" "applications_alb_prod" {
#   id = data.terraform_remote_state.applications_alb_prod.outputs.security_group_id
# }

# # Allow Applications ALB ingress to ECS for listener ports and health checks (ECS ephemeral ports)
# resource "aws_security_group_rule" "applications_alb_prod_ingress" {
#   security_group_id        = aws_security_group.security_group.id
#   description              = data.aws_security_group.applications_alb_prod.description
#   type                     = "ingress"
#   protocol                 = "tcp"
#   from_port                = 49153
#   to_port                  = 65535
#   source_security_group_id = data.aws_security_group.applications_alb_prod.id
# }

# # Allow Applications ALB to egress to ECS (assigned here as it goes away if ECS goes away, and to prevent a cycle with ALB) (ECS ephemeral ports)
# resource "aws_security_group_rule" "applications_alb_prod_egress" {
#   security_group_id        = data.aws_security_group.applications_alb_prod.id
#   description              = aws_security_group.security_group.description
#   type                     = "egress"
#   protocol                 = "tcp"
#   from_port                = 49153
#   to_port                  = 65535
#   source_security_group_id = aws_security_group.security_group.id
# }

# #==============================
# # Applications Internal ALB
# #==============================

# # Lookup Applications Internal ALB security group
# data "aws_security_group" "applications_internal_alb_prod" {
#   id = data.terraform_remote_state.applications_internal_alb_prod.outputs.security_group_id
# }

# # Allow Applications Internal ALB ingress to ECS for listener ports and health checks (ECS ephemeral ports)
# resource "aws_security_group_rule" "applications_internal_alb_prod_ingress" {
#   security_group_id        = aws_security_group.security_group.id
#   description              = data.aws_security_group.applications_internal_alb_prod.description
#   type                     = "ingress"
#   protocol                 = "tcp"
#   from_port                = 49153
#   to_port                  = 65535
#   source_security_group_id = data.aws_security_group.applications_internal_alb_prod.id
# }

# # Allow Applications Internal ALB to egress to ECS (assigned here as it goes away if ECS goes away, and to prevent a cycle with ALB) (ECS ephemeral ports)
# resource "aws_security_group_rule" "applications_internal_alb_prod_egress" {
#   security_group_id        = data.aws_security_group.applications_internal_alb_prod.id
#   description              = aws_security_group.security_group.description
#   type                     = "egress"
#   protocol                 = "tcp"
#   from_port                = 49153
#   to_port                  = 65535
#   source_security_group_id = aws_security_group.security_group.id
# }
