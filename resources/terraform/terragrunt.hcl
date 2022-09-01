locals {
  provider_vars = read_terragrunt_config(find_in_parent_folders("provider.hcl"))
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  provider_name = local.provider_vars.locals.provider_name
  provider_region_content = local.region_vars.locals.provider_region_content
  provider_version = {version = local.provider_vars.locals.provider_version}
  provider_content = merge(local.provider_region_content,local.provider_version)
}

# Generate a provider block
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
provider "${local.provider_name}" {
  %{for key, content in local.provider_content}
  ${key} = "${content}"%{endfor}
}
EOF
}