
resource "aws_cloudwatch_log_group" "ecs_cw_log_group" {
  name = "${var.name}-${var.env}-logs"
}

resource "aws_key_pair" "default" {
  key_name   = "${var.name}-${var.env}-keypair"
  public_key = data.aws_ssm_parameter.public_ssh_key.value
}

resource "aws_instance" "bastion" {
  ami                         = "ami-08333bccc35d71140"
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  key_name                    = aws_key_pair.default.key_name
}

resource "aws_route53_record" "record" {
  name    = var.dns_name
  type    = "A"
  ttl     = 300
  zone_id = var.zone_id
  records = [aws_instance.bastion.public_ip]
}
