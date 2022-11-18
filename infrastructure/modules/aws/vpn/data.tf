data "aws_ssm_parameter" "vpn_client_key" {
  name = "/terraform/prd/VPN_CLIENT_KEY"
}

data "aws_ssm_parameter" "vpn_client_cert" {
  name = "/terraform/prd/VPN_CLIENT_CERT"
}

data "aws_ssm_parameter" "vpn_root_cert" {
  name = "/terraform/prd/VPN_ROOT_CERT"
}
