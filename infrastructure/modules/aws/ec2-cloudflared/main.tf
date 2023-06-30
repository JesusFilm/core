resource "aws_instance" "ec2_cloudflared" {
  ami                         = "ami-02af4904e34687a9e"
  instance_type               = "t2.nano"
  associate_public_ip_address = true
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  user_data = templatefile("${path.module}/startup.sh", {
    cloudflared_token = var.cloudflared_token
    datadog_api_key   = data.aws_ssm_parameter.datadog_api_key.value
  })
}
