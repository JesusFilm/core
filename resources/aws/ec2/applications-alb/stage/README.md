# applications-alb/stage

Shared application load balancers for staging apps.
The load balancer will return a `404 Not Found` response if no rules are matched.

## Creates

- Application load balancer
  - http listener
    - http -> https rule
  - https listener

## Certificates

The following certificates are attached by default. Apps can use `aws_lb_listener_certificate` to attach additional
certificates. There is a hard limit of 25 certificates.

- `*.core.jesusfilm.org`

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## Requirements

| Name      | Version  |
| --------- | -------- |
| terraform | >= 1.1.7 |
| aws       | ~> 4.22  |

## Providers

| Name | Version |
| ---- | ------- |
| aws  | ~> 4.22 |

## Inputs

No inputs.

## Outputs

| Name               | Description                        |
| ------------------ | ---------------------------------- |
| http_listener_arn  | HTTP listener ARN                  |
| https_listener_arn | HTTPS listener ARN                 |
| load_balancer_arn  | Load balancer ARN                  |
| security_group_id  | Applications ALB security group ID |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
