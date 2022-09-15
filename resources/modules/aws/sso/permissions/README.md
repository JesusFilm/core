# AWS::SSO::Permissions
Constructs an AWS SSO Permission Set and grants Okta Users/Groups access.

#### Example
```terraform
module "network_engineering" {
  source = "git@github.com:CruGlobal/cru-terraform-modules.git//aws/sso/permissions"
  
  name         = "network-engineering"
  description  = "Network Administration"
  landing_page = "https://console.aws.amazon.com/vpc/home?region=us-east-1"
  
  # Network read-only access (changes should be done through Terraform)
  iam_policy_arns = ["arn:aws:iam::aws:policy/AWSNetworkManagerReadOnlyAccess"]
  
  okta_groups = ["network-engineering-team"]
  okta_users  = ["tony@starkindustries.com"]
  
  tags = {
    managed_by = "terraform"
    terraform  = replace(abspath(path.root), "/^.*/(cru-terraform|default)/", "")
  }
}
```

## Known Issues
1. This module creates group and user assignments to the Okta managed "AWS Single Sign-on" SAML application. 
   When this occurs, Okta automatically provisions the users, and users in a group, to AWS IdentityStore. Groups are 
   not provisioned automatically to AWS. Because of this, the module reads Okta Group membership and assigns SSO 
   Permission Set to the users. If a user is added to a group in Okta, that user will be provisioned to AWS, but will not 
   automatically be granted access to the Permission Set until the terraform is re-run, thus picking up the new user. 
   Conversely, if a user is removed from a group in Okta, they will be deactivated in AWS, but access to the Permission Set 
   will still exist until the terraform is re-run to pick up the change in group membership. Even though the access still 
   exists, the user will be unable to login since they have been marked deactivated (un-provisioned).

2. This module enables a feature to retain user/group assignments in the Okta app when they are destroyed in terraform.
   This fixes and issue where removing an assignment in one location cause it to be removed in all other locations. The one
   caveat with this is that users who have been granted access to the AWS Okta app, are never removed. They can always log
   unless they are manually removed from the Okta UI. In our use case, this is fine, as the permissions on the AWS side are
   removed. They can log in, but can't see or do anything.

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.0.0 |
| aws | >= 3.74.0, < 5.0.0 |
| okta | >= 3.10.1, < 4.0.0 |

## Providers

| Name | Version |
|------|---------|
| aws | >= 3.74.0, < 5.0.0 |
| okta | >= 3.10.1, < 4.0.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_ssoadmin_account_assignment.assignments](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssoadmin_account_assignment) | resource |
| [aws_ssoadmin_managed_policy_attachment.policies](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssoadmin_managed_policy_attachment) | resource |
| [aws_ssoadmin_permission_set.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssoadmin_permission_set) | resource |
| [aws_ssoadmin_permission_set_inline_policy.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssoadmin_permission_set_inline_policy) | resource |
| [okta_app_group_assignment.groups](https://registry.terraform.io/providers/okta/okta/latest/docs/resources/app_group_assignment) | resource |
| [okta_app_user.users](https://registry.terraform.io/providers/okta/okta/latest/docs/resources/app_user) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| aws\_account\_ids | List of AWS account ids where access is granted. Defaults to organization root account (cruds). | `list(string)` | `[]` | no |
| description | The description of the Permissions. | `string` | n/a | yes |
| iam\_policy\_arns | List of IAM policies that define permissions granted. | `list(string)` | `[]` | no |
| iam\_policy\_document\_json | Custom inline IAM policy document that defines permissions granted. | `string` | `null` | no |
| landing\_page | The URL used to redirect users within the application during the federation authentication process. | `string` | `"https://console.aws.amazon.com/console/home?region=us-east-1"` | no |
| name | The internal unique name of the Permissions. | `string` | n/a | yes |
| okta\_groups | List of Okta group names to be granted access. | `list(string)` | `[]` | no |
| okta\_users | List of individual Okta user logins (email address) to be granted access. | `list(string)` | `[]` | no |
| session\_duration | The length of time that the application user sessions are valid in the ISO-8601 standard. Default: PT2H. | `string` | `"PT4H"` | no |
| tags | Key-value map of resource tags. | `map(string)` | n/a | yes |

## Outputs

No outputs.
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
