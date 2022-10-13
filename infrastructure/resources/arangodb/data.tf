data "aws_ssm_parameter" "oasis_api_key" {
  name = "/arangodb/prd/OASIS_API_KEY"
}

data "aws_ssm_parameter" "oasis_api_secret" {
  name = "/arangodb/prd/OASIS_API_SECRET"
}

data "aws_ssm_parameter" "oasis_organization_id" {
  name = "/arangodb/prd/OASIS_ORGANIZATION_ID"
}

data "oasis_organization" "jesusfilm" {
  id = data.aws_ssm_parameter.oasis_organization_id.value
}
