resource "aws_instance" "datadog_aurora" {
  ami                         = "ami-02af4904e34687a9e"
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  user_data_replace_on_change = true
  user_data = templatefile("${path.module}/startup.sh", {
    datadog_api_key    = data.aws_ssm_parameter.datadog_api_key.value
    postgres_instances = <<EOT
%{for v in var.rds_instances~}
  - host: ${v.host}
    port: ${v.port}
    username: ${v.username}
    password: ${v.password}
    dbname: ${var.env}
    tags:
      - 'dbinstanceidentifier:${v.db_instance_name}'
%{endfor~}
EOT
  })
  private_dns_name_options {
    hostname_type = "resource-name"
  }
  tags = {
    Name = "${var.name}-${var.env}"
  }
}
