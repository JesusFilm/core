# key_with_alias

Creates single KMS resource with associated alias and predefined policy granting particular access rights to particular roles, with parent module providing member list for each role.

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
| [aws_iam_policy_document](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) |
| [aws_kms_alias](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_alias) |
| [aws_kms_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_key) |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| application | Application name | `string` | `""` | no |
| deletion\_window\_in\_days | The minimum number of days which must transpire before a key can be deleted. Minimum allowed 7. | `string` | `"30"` | no |
| description | The description of the kms key. | `string` | `"Managed by Terraform"` | no |
| enable\_key\_rotation | Whether or not to enable key rotation. 'true' or 'false'. | `string` | `"true"` | no |
| environment | Environment (eg. prod, stage, lab) | `string` | `""` | no |
| key\_tags | A map of tags to add to KMS key resource | `map(string)` | `{}` | no |
| name | The name of the kms key alias. | `string` | n/a | yes |
| trusted\_kms\_admin\_arns | ARNs of AWS entities who can have admin rights use of the key | `list(string)` | `[]` | no |
| trusted\_kms\_arns | ARNs of AWS entities who can have carte blanche use of the key | `list(string)` | `[]` | no |
| trusted\_kms\_role\_arns | ARNs of AWS entities who will have basic role rights use of the key | `list(string)` | `[]` | no |

## Outputs

| Name | Description |
|------|-------------|
| kms\_alias\_arn | The Amazon Resource Name (ARN) specifying the key. |
| kms\_alias\_name | The name of the key alias. |
| kms\_key\_arn | The Amazon Resource Name (ARN) specifying the key. |
| kms\_key\_description | The description of the key. |
| kms\_key\_policy\_document | The policy document. |
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
