module "aurora" {
  source  = "terraform-aws-modules/rds-aurora/aws"

  name           = "${local.identifier}-${local.env}-postgres96"
  engine         = "aurora-postgresql"
  engine_version = "11.12"
  instance_class = "db.r6g.large"
  instances = {
    1 = {
      publicly_accessible = true
    }
  }

  vpc_id  = "vpc-12345678"
  subnets = ["subnet-12345678", "subnet-87654321"]

  allowed_security_groups = ["sg-12345678"]
  allowed_cidr_blocks     = ["10.20.0.0/20"]

  storage_encrypted   = true
  apply_immediately   = true
  monitoring_interval = 10

  db_parameter_group_name         = "default"
  db_cluster_parameter_group_name = "default"

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}