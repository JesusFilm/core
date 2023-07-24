resource "aws_key_pair" "default" {
  key_name   = "${var.name}-${var.env}-keypair"
  public_key = data.aws_ssm_parameter.public_ssh_key.value
}

resource "aws_instance" "ec2_cloudflared" {
  ami                         = "ami-02af4904e34687a9e"
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  key_name                    = aws_key_pair.default.key_name
  user_data_replace_on_change = true
  user_data = templatefile("${path.module}/startup.sh", {
    cloudflared_token = var.cloudflared_token
    datadog_api_key   = data.aws_ssm_parameter.datadog_api_key.value
  })
  private_dns_name_options {
    hostname_type = "resource-name"
  }
  tags = {
    Name = "${var.name}-${var.env}"
  }
}
