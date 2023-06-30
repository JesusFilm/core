
resource "aws_cloudwatch_log_group" "ecs_cw_log_group" {
  name = "${var.name}-${var.env}-logs"
}

resource "aws_instance" "bastion" {
  ami                         = "ami-02af4904e34687a9e"
  instance_type               = "t2.nano"
  associate_public_ip_address = true
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  user_data = templatefile("${path.module}/startup.sh", {
    cloudflared_token = var.cloudflared_token
  })
}
