data "aws_ssm_parameter" "public_ssh_key" {
  name = "/terraform/prd/SSH_TUNNEL_PUBLIC_KEY"
}
