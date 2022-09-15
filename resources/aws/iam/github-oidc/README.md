# GitHub OIDC

GitHub IAM OpenID Connect provider. Used to allow GitHub to assume roles into AWS, primarily for GitHub Actions.
See https://github.com/aws-actions/configure-aws-credentials#assuming-a-role

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.0.9 |
| aws | ~> 3.70 |

## Providers

| Name | Version |
|------|---------|
| aws | ~> 3.70 |
| tls | n/a |

## Inputs

No input.

## Outputs

| Name | Description |
|------|-------------|
| github\_oidc\_arn | The ARN assigned by AWS for the GitHub OIDC provider. |
| github\_provider\_hostname | The URL of the identity provider. Corresponds to the iss claim. |
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->