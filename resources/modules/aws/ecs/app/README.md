# app
Constructs resources to support a "standard" Cru ECS app.

Included:
 * IAM task execution role with permissions to run the task and read (SSM parameter) secrets
 * IAM task role
 * Route53 CNAME record for load balancer (optional)
 * Target Group (optional)
 * Load balancer listener rule to forward to target group based on host headers (optional)
 * Additional certificates attached to the HTTPS listener of the load balancer (optional)
 * Grants developers access to assume the role (Okta users)
 * Grant devops-engineering-team access to assume the role (optional)
 * SSM Parameters
 * Datadog monitors for container oom and healthcheck failures

Notes:
 * the ECR repo name must exactly match `identifier`
 * The app secrets must reside within this SSM path: `/ecs/{identifier}/{env}/`
 * The service config must specify `{identifier}-{env}-TaskExecutionRole` as the task execution role.
 * The service config must specify `{identifier}-{env}-TaskRole` as the task role.
 * The service config must specify the name of the `load_balancer_arn` provided to the module.
 * The service config must specify the name of the `target_group`.
 * If `zone_id` is not provided, no dns name will be created. Otherwise:
   *  for non-`prod` environments, the dns name will be `{identifier}-{env}.{dns_parent}`,
      where `dns_parent` is the name of the zone whose id is `zone_id`
   *  for `prod` environments, the dns name will be `{identifier}.{dns_parent}`.

### SSM Parameters (secrets).
The `parameters` variable is a map of either string values, objects with a value key (`object({ value = string })`) or
a combination of both. Map keys will be the parameter (secret) name. Objects may also contain `type` and `owner` keys
where type is one of `RUNTIME`, `BUILD` or `ALL`, and owner is an email address of the person or group managing the
secret. Parameter value must be convertible to a `string` and **MUST** not be empty.
```hcl-terraform
parameters = {
  PARAMETER_FOO = "value"
  PARAMETER_BAR = {
    value = "value"
  }
  PARAMETER_BAZ = {
    value = "value"
    type  = "ALL"
    owner = "name@example.com"
  }
}
```

If `maintenance_db_index` or `redis_db_index` are set to a positive number, then default Redis parameters are added
corresponding to the current `env`. The `value`, `type` and `owner` can be overwritten using parameters. You must
specify the `value` and can not override just the optional fields.
```hcl-terraform
redis_db_index = 12
parameters = {
  # Set Session Redis db index to a different value than the default
  SESSION_REDIS_DB_INDEX = 14

  # Set Storage port to a non-standard value
  STORAGE_REDIS_PORT = 5362
}
```

If `maintenance_db_index` is set to a positive number (default is 3), the following parameters are defined:
* MAINTENANCE_REDIS_HOST
* MAINTENANCE_REDIS_PORT
* MAINTENANCE_REDIS_DB_INDEX

If `redis_db_index` is set to a positive number (default is -1), the following parameters are defined:
* SESSION_REDIS_HOST
* SESSION_REDIS_PORT
* SESSION_REDIS_DB_INDEX
* STORAGE_REDIS_HOST
* STORAGE_REDIS_PORT
* STORAGE_REDIS_DB_INDEX

### ECS services
The `services` variable controls how many and of what type of ECS services are created. Every service must have a
unique name that is used to distinguish different services/containers within a single app. The default is `app`.

The default type of `app` will create a service that is attached to a load_balancer and target_group. The
`sidekiq` and `daemon` types will create a service without the load balancer attachment.

Examples of services:
```hcl-terraform
// Default if not defined
services = [{name = "app"}]

// Don't create any services
services = []

// Application and single sidekiq
services = [{ name = "app" }, { name = "sidekiq", type = "sidekiq" }]

// Application and two sidekiq (memory optimized queue/gluttonous queue)
services = [{ name = "app" }, { name = "optimized", type = "sidekiq" }, { name = "gluttonous", type = "sidekiq" }]

// Application in FARGATE
services = [{
    name                  = "app",
    launch_type           = "FARGATE",
    network_mode          = "awsvpc"
    network_configuration = jsonencode({subnets = data.terraform_remote_state.vpc.outputs.prod_apps_subnet_ids})
}]
```

See [Service Inputs](#service-inputs) for additional service configuration.

#### placement_strategy
The default placement strategy for `prod` services are:
```hcl-terraform
[{type = "spread", field = "attribute:ecs.availability-zone"}, {type = "binpack", field = "memory"}]
```
All other environments default to:
```hcl-terraform
[{type = "binpack", field = "memory"}]
```
Setting `placement_strategy` on a service will completely override the defaults. The value must be jsonencoded in order to conform to the `map` constraints.
```hcl-terraform
placement_strategy = jsonencode([{
  type = "spread"
  field = "cpu"
}])
```

### Upgrading
* v5.x.x to v6.0.0+
    - If `target_group` or `listener_rule` were created outside the app, and it's now going to be managed by the
    module, the following state keys must be moved.
        - `terraform state mv aws_lb_target_group.{identity} module.{name}}.aws_lb_target_group.target_group[0]`
        - `terraform state mv aws_lb_listener_rule.https module.{name}.aws_lb_listener_rule.rule[0]`

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.0.0 |
| aws | >= 3.74.0, < 5.0.0 |
| datadog | ~> 3.10 |
| external | ~> 2.0 |
| github | >= 4.20.0, < 5.0.0 |
| okta | >= 3.20, < 4.0.0 |
| random | ~> 3.0 |

## Providers

| Name | Version |
|------|---------|
| aws | >= 3.74.0, < 5.0.0 |
| datadog | ~> 3.10 |
| external | ~> 2.0 |
| github | >= 4.20.0, < 5.0.0 |
| random | ~> 3.0 |
| terraform | n/a |

## Modules

| Name | Source | Version |
|------|--------|---------|
| sso | ../../sso/permissions | n/a |

## Resources

| Name | Type |
|------|------|
| [aws_cloudwatch_event_rule.rule](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_rule) | resource |
| [aws_cloudwatch_event_target.target](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target) | resource |
| [aws_ecs_service.service](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service) | resource |
| [aws_ecs_task_definition.task_definition](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_task_definition) | resource |
| [aws_iam_role.task_execution_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role.task_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy.task_execution_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_iam_role_policy.task_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_iam_role_policy_attachment.task_execution_policies](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.task_execution_role_can_execute_ecs_task](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.task_execution_role_can_execute_scheduled_task](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.task_policies](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_lb_listener_certificate.cert](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener_certificate) | resource |
| [aws_lb_listener_rule.rule](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener_rule) | resource |
| [aws_lb_target_group.target_group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group) | resource |
| [aws_route53_record.alb_cname](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_ssm_parameter.parameters](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [datadog_monitor.container_healthcheck](https://registry.terraform.io/providers/DataDog/datadog/latest/docs/resources/monitor) | resource |
| [datadog_monitor.container_oom](https://registry.terraform.io/providers/DataDog/datadog/latest/docs/resources/monitor) | resource |
| [datadog_monitor.deploy_failure](https://registry.terraform.io/providers/DataDog/datadog/latest/docs/resources/monitor) | resource |
| [random_string.suffix](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/string) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| additional\_task\_execution\_policy\_arns | Attach additional IAM policies to the task execution role. | `list(string)` | `[]` | no |
| additional\_task\_policy\_arns | Attach additional IAM policies to the task role. | `list(string)` | `[]` | no |
| certificates | Additional certificates to add to the HTTPS load balancer listener. | `list(string)` | `[]` | no |
| contact\_email | Email address to contact with question about this application. Prefer group email. | `string` | n/a | yes |
| create\_listener\_rule | Should a load balancer listener rule be created? Must be false if `target_group_arns` is set. | `bool` | `true` | no |
| create\_target\_group | Should a target group be created? | `bool` | `true` | no |
| developers | Grant Okta users (emails) access to assume the role. | `set(string)` | `[]` | no |
| dns\_name | DNS record to add, must include zone name. Defaults to "{identifier}[-{env}].{zone\_name}". | `string` | `""` | no |
| env | Environment (prod, stage, lab) | `string` | n/a | yes |
| extra\_tags | AWS Tags, merged with local tags | `map(string)` | `{}` | no |
| github\_repo | GitHub repository. Must be owned by CruGlobal. Defaults to `identifier` | `string` | `""` | no |
| grant\_devops\_access | Grant the devops team access to assume the application role. | `bool` | `true` | no |
| identifier | Application Identifier (most often the github repo name) | `string` | n/a | yes |
| listener\_arn | Load balancer listener ARN to add rule to. Defaults to "HTTPS" listener on `load_balancer_arn`. | `string` | `""` | no |
| listener\_rule\_hostnames | List of DNS names to listen to and forward to the target\_group, in addition to `domain_name`. | `list(string)` | `[]` | no |
| load\_balancer\_arn | Load balancer ARN to use. | `string` | `""` | no |
| maintenance\_db\_index | MAINTENANCE redis DB index. If set to -1, MAINTENANCE parameters will not be added to parameter store. | `number` | `3` | no |
| notification\_recipients | List of email adresses to receive alerts from Datadog | `list(string)` | `[]` | no |
| parameters | SSM Parameters (secrets). See above for more details. | `any` | `{}` | no |
| redis\_db\_index | Redis DB index. If set, redis SESSION and STORAGE parameters will be added to parameter store. | `number` | `-1` | no |
| scheduled\_tasks | ECS Schedule Tasks. | `list(map(string))` | `[]` | no |
| services | ECS Services. Defaults to a single `app` service. | `list(map(string))` | <pre>[<br>  {<br>    "name": "app"<br>  }<br>]</pre> | no |
| sso\_iam\_policy\_arns | Attach IAM policies to the SSO Permission Set. These are required to be AWS managed. | `list(string)` | `[]` | no |
| target\_group\_arn | Target group ARN to forward listener rule to. Ignored if `create_target_group` is true, or if `target_group_arns` is set. | `string` | `""` | no |
| target\_group\_arns | Set of target group ARNs to forward listener rule to. Ignored if `create_target_group` is true. | `set(string)` | `null` | no |
| target\_group\_deregistration\_delay | The amount time for Elastic Load Balancing to wait before changing the state of a deregistering target from draining to unused. Default 60 | `number` | `60` | no |
| target\_group\_healthcheck\_path | Target group healthcheck path. Defaults to "/monitors/lb". | `string` | `"/monitors/lb"` | no |
| target\_group\_name | Target group name. Defaults to "{identifier}-{env}" with underscores replaced by dashes. | `string` | `""` | no |
| target\_group\_port | Target group port. Defaults to 80. | `number` | `80` | no |
| target\_group\_protocol | Target group protocol. Defaults to "HTTP". | `string` | `"HTTP"` | no |
| target\_group\_stickiness\_enabled | Should the target group use cookie-based sticky sessions? | `bool` | `false` | no |
| target\_group\_target\_type | The type of target that you must specify when registering targets with this target group (instance, ip). | `string` | `"instance"` | no |
| task\_assume\_role\_policy\_override\_json | Additional IAM policy document json to override the task assume role¹. | `string` | `"{}"` | no |
| task\_execution\_policy\_override\_json | Additional IAM policy document json to override the task execution role¹. | `string` | `"{}"` | no |
| task\_names | List of ECS service/scheduled task names provided in the `services` and `scheduled_tasks` variables. | `list(string)` | <pre>[<br>  "app"<br>]</pre> | no |
| task\_policy\_override\_json | Additional IAM policy document json to override the task role¹ and SSO Permission Set. | `string` | `"{}"` | no |
| zone\_id | The id of the DNS zone in which the app's domain name will live. If blank, no domain name will be created. | `string` | `""` | no |

## Outputs

| Name | Description |
|------|-------------|
| domain\_name | Route53 record name created if zone\_id was present |
| listener\_rule\_arn | The ARN of the rule. |
| service\_names | ECS Service Names |
| target\_group\_arn | The ARN of the Target Group. Undefined if `target_group_arns` is set. |
| task\_execution\_role\_arn | The task execution role ARN |
| task\_role\_arn | The task role ARN |
| task\_role\_unique\_id | The task role unique\_id |
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## Service Inputs

| Name                               | Description                                                                                                                                                                             | Type                                                                                                      | Default                          |        Required        |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|----------------------------------|:----------------------:|
| name                               | Unique identifier (app, sidekiq, sidekiq-1) Must be unique between services and scheduled_tasks.                                                                                        | `string`                                                                                                  |                                  |          yes           |
| type                               | Service type (app, sidekiq, daemon).                                                                                                                                                    | `string`                                                                                                  | `"app"`                          |           no           |
| capacity_provider_strategy         | The capacity provider strategy to use for the service. Can be one or more.                                                                                                              | `jsonencode(list(object(capacity_provider=string, weight=number, base=number)))`                          |                                  |           no           |
| cluster                            | ARN of an ECS cluster.                                                                                                                                                                  | `string`                                                                                                  | `var.env` cluster                |           no           |
| container_port                     | The port on the container to associate with the load balancer (type = `app`) Defaults to target_group port.                                                                             | `string`                                                                                                  | `"0"`                            |           no           |
| cpu                                | The number of cpu units used by the task.                                                                                                                                               | `string`                                                                                                  | `"128"`(EC2)<br>`"256"`(FARGATE) | Required for `FARGATE` |
| desired_count                      | The number of instances of the task definition to place and keep running.                                                                                                               | `string`                                                                                                  | `"2"`(prod)<br>`"1"`(lab,stage)  |           no           |
| deployment_circuit_breaker         | Enable deployment circuit breaker logic?                                                                                                                                                | `string`                                                                                                  | `"true"`                         |           no           |
| deployment_maximum_percent         | Upper limit (as a percentage of the service's desiredCount) of the number of running tasks that can be running in a service during a deployment.                                        | `string`                                                                                                  | `""`                             |           no           |
| deployment_minimum_healthy_percent | Lower limit (as a percentage of the service's desiredCount) of the number of running tasks that must remain running and healthy in a service during a deployment.                       | `string`                                                                                                  | `""`                             |           no           |
| environment                        | Additional environment variables to pass to a container. PROJECT_NAME and ENVIRONMENT will always be present.                                                                           | `jsonencode(map(string))`                                                                                 | `"{}"`                           |           no           |
| essential                          | The container is essential.                                                                                                                                                             | `string`                                                                                                  | `"true"`                         |           no           |
| health_check                       | The container health check command and associated configuration parameters for the container.                                                                                           | `jsonencode(object(command=string, retries=number, timeout=number, interval=number, startPeriod=number))` |                                  |           no           |
| health_check_grace_period          | Seconds to ignore failing load balancer health checks on newly instantiated tasks to prevent premature shutdown.                                                                        | `string`                                                                                                  | `"15"`                           |           no           |
| host_port                          | The port number on the container instance to reserve for your container. `"0"` results in a dynamic assignment.                                                                         | `string`                                                                                                  | `"0"`                            |           no           |
| launch_type                        | The launch type on which to run your service. (EC2, FARGATE)                                                                                                                            | `string`                                                                                                  | `"EC2"`                          |           no           |
| log_configuration                  | Task Log configuration. See [locConfiguration](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_LogConfiguration.html)                                                     | `jsonencode(object(logDriver=string, options=map(string)))`                                               | `"{}"`                           |           no           |
| memory                             | The hard limit (in MiB) of memory to present to the task.                                                                                                                               | `string`                                                                                                  | `"1024"`                         |           no           |
| memory_reservation                 | The soft limit (in MiB) of memory to reserve for the container.                                                                                                                         | `string`                                                                                                  |                                  |           no           |
| network_configuration              | The network configuration for the service. Required for network mode `awsvpc`.                                                                                                          | `jsonencode(object({subnets=list(string), security_groups=list(string), assign_public_ip=bool}))`         |                                  |           no           |
| network_mode                       | The Docker networking mode to use for the containers in the task (none, bridge, awsvpc, host).                                                                                          | `string`                                                                                                  |                                  |           no           |
| placement_strategy                 | Service level strategy rules that replace default task placement. See [placement_strategy](#placement_strategy).                                                                        | `jsonencode(list(object({ type=string, field=string})))`                                                  | `"[]"`                           |           no           |
| scheduling_strategy                | The scheduling strategy to use (REPLICA, DAEMON).                                                                                                                                       | `string`                                                                                                  | `"REPLICA"`                      |           no           |
| service_registry                   | The service discovery registries for the service. See [service_registries](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service#service_registries). | `jsonencode(object(any))`                                                                                 |                                  |           no           |
| volumes                            | A set of volumes that containers in your task may use.                                                                                                                                  | `jsonencode(list(object(name=string, host_path=string, container_path=string, read_only=bool)))`          |                                  |           no           |

## Schedule Task Inputs

| Name                  | Description                                                                                                                                                       | Type                                                                                              | Default                          |        Required        |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|----------------------------------|:----------------------:|
| name                  | Unique identifier (cron, daily, hourly) Must be unique between services and scheduled_tasks.                                                                      | `string`                                                                                          |                                  |          yes           |
| cluster               | ARN of an ECS cluster.                                                                                                                                            | `string`                                                                                          | `var.env` cluster                |           no           |
| cpu                   | The number of cpu units used by the task.                                                                                                                         | `string`                                                                                          | `"128"`(EC2)<br>`"256"`(FARGATE) | Required for `FARGATE` |
| desired_count         | The number of instances of the task definition run.                                                                                                               | `string`                                                                                          | `"1"`                            |           no           |
| environment           | Additional environment variables to pass to a task. PROJECT_NAME and ENVIRONMENT will always be present.                                                          | `jsonencode(map(string))`                                                                         | `"{}"`                           |           no           |
| essential             | The container is essential.                                                                                                                                       | `string`                                                                                          | `"true"`                         |           no           |
| log_configuration     | Task Log configuration. See [locConfiguration](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_LogConfiguration.html)                               | `jsonencode(object(logDriver=string, options=map(string)))`                                       | `"{logDriver = "awslogs"}"`      |           no           |
| launch_type           | The launch type on which to run your task. (EC2, FARGATE)                                                                                                         | `string`                                                                                          | `"FARGATE"`                      |           no           |
| memory                | The hard limit (in MiB) of memory to present to the task.                                                                                                         | `string`                                                                                          | `"1024"`                         |           no           |
| memory_reservation    | The soft limit (in MiB) of memory to reserve for the container.                                                                                                   | `string`                                                                                          |                                  |           no           |
| network_configuration | The network configuration for the task. Required for network mode `awsvpc`.                                                                                       | `jsonencode(object({subnets=list(string), security_groups=list(string), assign_public_ip=bool}))` |                                  |           no           |
| network_mode          | The Docker networking mode to use for the containers in the task (none, bridge, awsvpc, host).                                                                    | `string`                                                                                          | `"awsvpc"`                       |           no           |
| volumes               | A set of volumes that containers in your task may use.                                                                                                            | `jsonencode(list(object(name=string, host_path=string, container_path=string, read_only=bool)))`  |                                  |           no           |
| schedule_expression   | The scheduling expression. For example, `cron(0 20 * * ? *)` or `rate(5 minutes)`.                                                                                | `string`                                                                                          | `"rate(1 day)"`                  |           no           |
| platform_version      | Specifies the platform version for the task. Specify only the numeric portion of the platform version, such as 1.1.0. This is used only if LaunchType is FARGATE. | `string`                                                                                          | `"1.4.0"`                        |           no           |

1. <a id="1"/>See [iam_policy_document#override_json](https://www.terraform.io/docs/providers/aws/d/iam_policy_document.html#override_json) for mor information on how overriding json works.
