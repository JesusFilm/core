module "plausible" {
  source                = "../../../infrastructure/modules/aws/ecs-task-base"
  ecs_config            = var.ecs_config
  service_config        = local.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.environment_variables
  docker_image          = "ghcr.io/plausible/community-edition:v2.1.0"
}

# module "postgresql" {
#   source                  = "../../../infrastructure/modules/aws/aurora"
#   name                    = "plausible"
#   env                     = var.env
#   doppler_token           = var.doppler_token
#   doppler_project         = "plausible"
#   subnet_group_name       = var.subnet_group_name
#   vpc_security_group_id   = var.vpc_security_group_id
#   PG_DATABASE_URL_ENV_VAR = "DATABASE_URL"
# }


# Create App User
# resource "postgresql_role" "application_role" {
#   name               = "dev_appuser"
#   login              = true
#   password           = "myappuserpassword"
#   encrypted_password = true
#   depends_on         = [aws_db_instance.dev_db]
# }
# # Create Database 
# resource "postgresql_database" "dev_db" {
#   name              = "mydatabase1"
#   owner             = "dev"
#   template          = "template0"
#   lc_collate        = "C"
#   connection_limit  = -1
#   allow_connections = true
#   depends_on        = [aws_db_instance.dev_db]
# }
