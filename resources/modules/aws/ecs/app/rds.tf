resource "aws_rds_cluster" "default" {
  cluster_identifier      = "${local.name}-postgresql"
  engine                  = "aurora-postgresql"
  availability_zones      = data.aws_availability_zones.main.names.*
  db_subnet_group_name    = data.aws_db_subnet_group.main.id
  database_name           = var.env
  master_username         = "root"
  master_password         = var.database_root_pass
  backup_retention_period = 5
  preferred_backup_window = "07:00-09:00"
}

# resource "postgresql_role" "user" {
#   name = var.database_user
#   login = true
#   password = var.database_pass
#   encrypted_password = true  
# }