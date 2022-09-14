# applications-alb

Shared application load balancer.
The load balancer will return a `404 Not Found` response if no rules are matched.

## Creates

- Application load balancer
  - http listener
    - http -> https rule
  - https listener

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## Requirements

| Name      | Version            |
| --------- | ------------------ |
| terraform | >= 1.0.0           |
| aws       | >= 3.74.0, < 5.0.0 |

## Providers

| Name | Version            |
| ---- | ------------------ |
| aws  | >= 3.74.0, < 5.0.0 |

## Modules

No modules.

## Resources

| Name                                                                                                                                                  | Type     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| [aws_lb.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb)                                                         | resource |
| [aws_lb_listener.http](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener)                                       | resource |
| [aws_lb_listener.https](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener)                                      | resource |
| [aws_lb_listener_certificate.core_jesusfilm_org](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener_certificate) | resource |

## Inputs

| Name              | Description                                                      | Type           | Default              | Required |
| ----------------- | ---------------------------------------------------------------- | -------------- | -------------------- | :------: |
| add_http_listener | Add an HTTP listener with a default HTTP->HTTPS redirect action. | `bool`         | `true`               |    no    |
| certificates_arns | Default certificates ARNs to attach to the LB https listener.    | `list(string)` | n/a                  |   yes    |
| env               | Environment (prod, stage, lab)                                   | `string`       | n/a                  |   yes    |
| extra_tags        | AWS Tags, merged with local tags                                 | `map(string)`  | `{}`                 |    no    |
| identifier        | Resource name                                                    | `string`       | `"applications-alb"` |    no    |
| idle_timeout      | The time in seconds that the connection is allowed to be idle.   | `number`       | `60`                 |    no    |
| internal          | If true, the LB will be internal.                                | `bool`         | `false`              |    no    |
| log_bucket        | The S3 bucket name to store the logs in.                         | `string`       | `"cru-alb-logs"`     |    no    |
| security_groups   | A list of security group IDs to assign to the LB.                | `list(string)` | n/a                  |   yes    |
| subnets           | A list of subnet IDs to attach to the LB.                        | `list(string)` | n/a                  |   yes    |

## Outputs

| Name               | Description        |
| ------------------ | ------------------ |
| http_listener_arn  | HTTP listener ARN  |
| https_listener_arn | HTTPS listener ARN |
| load_balancer_arn  | Load balancer ARN  |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
