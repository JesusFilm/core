# app
Constructs an SSM secret intended for consumption by a "standard" Cru ECS app.

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.0.0 |
| aws | >= 3.74.0, < 5.0.0 |

## Providers

| Name | Version |
|------|---------|
| aws | >= 3.74.0, < 5.0.0 |

## Modules

No Modules.

## Resources

| Name |
|------|
| [aws_ssm_parameter](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| contact\_email | Email address to contact with question about this application. Prefer group email. | `string` | n/a | yes |
| env | Environment (prod, stage, lab) | `string` | n/a | yes |
| extra\_tags | AWS Tags, merged with local tags | `map(string)` | `{}` | no |
| identifier | Application Identifier (most often the github repo name) | `string` | n/a | yes |
| key | The environment variable name | `string` | n/a | yes |
| param\_type | The secret value | `string` | `"RUNTIME"` | no |
| value | The secret value | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| parameter\_value | Value of ssm parameter |
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
