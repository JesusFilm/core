# data-world-crawler-job
Constructs AWS resources to run a periodic data.world crawl.

Data.world provides a docker-based utility for scanning a database schema and
building an RDF catalog file from it.
This module creates a periodic ECS job to run this utility against a particular database schema
(or dataset, in BigQuery's case),
and to upload the catalog file to data.world.
(This gives analysts a sense of the kinds of data Cru holds,
even if that particular database isn't "hooked up" to data.world directly.)
The two docker images for this job are defined by
https://github.com/CruGlobal/data-world-crawler/.


This module heavily leans on a third-party module,
https://github.com/tmknom/terraform-aws-ecs-scheduled-task,
which provides exactly the right things we need to run a periodic ECS task.
The scheduled-task module is nested within this module,
because this is a good use case for encapsulation;
it's not like the `consul_cluster` example at
https://www.terraform.io/docs/modules/composition.html.
If we didn't use encapsulation, call sites would have to manage the scheduled-task module 
with a dozen or so lines of boilerplate,
and the inputs and outputs of the two modules would be intertwined.
So, callers should generally not need to worry about the scheduled-task details,
but maintainers should be aware it exists, if debugging is required.


The crawler runs once per week, at a time determined by cloudwatch
(since we don't care exactly when it runs).
Most call sites should look like this:
```hcl-terraform
module "crawler" {
  source = "git@github.com:CruGlobal/cru-terraform-modules.git//aws/ecs/data-world-crawler-job?ref=v8.1.0"

  identifier = "ert"
  env        = "prod"
  collection_name = "Event Registration Tool"
  database_type = "postgresql"
  host = module.database.rds_address
}
```
Some callers will need to specify a non-default `org_name`, such as `cru-us-campus`.
Some callers (those that use a shared database)
will need to specify a non-default `credentials_identifier`, such as 'postgres-bundle-a'.

This module currently supports mysql, postgres, and bigquery.
For mysql and postgres, a database password must be installed in SSM by the DBAs beforehand
at this address: `/data-world-crawler/{credentials_identifier}/{env}/PASSWORD`.
For bigquery, a service account (base64 decoded) key must be installed in SSM
at this address: `/data-world-crawler/{credentials_identifier}/{env}/CREDENTIAL_FILE_CONTENTS`.


Oracle support is currently broken, due to problems in the cataloging utility.
Once data.world fixes that, this module will support oracle.
(Though it's likely RAC will not be supported.)

This module is stateless; it is always acceptable to destroy and re-create it.

Logs are captured and sent to datadog.
You can view recent logs here:
https://app.datadoghq.com/logs?cols=service&event&index=&live=true&messageDisplay=inline&query=integration%3Adata-world

The `cru-data` catalog files are uploaded here, where you can inspect them manually:
https://data.world/cru-data/ddw-catalogs 

This module requires a datadog api key for logging, and a data.world api key for the uploads;
these are copied from LastPass into SSM manually (one time) by `setup.sh`.
This has already been run, but could be run again if the api key(s) need to be rotated.
The setup script requires `lpass`; you can install it via `homebrew`.
You must also have access to the "Shared-DevOps Engineering Team" LastPass folder.

There is currently no alerting if the crawler fails.
There is a chance this project will be retired in 6 months
(See https://github.com/CruGlobal/data-world-crawler/tree/initial#future),
so we'll not bother with it for now.


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

| Name | Source | Version |
|------|--------|---------|
| ecs\_scheduled\_task | git::https://github.com/CruGlobal/terraform-aws-ecs-scheduled-task.git | add-volumes |

## Resources

| Name | Type |
|------|------|
| [aws_iam_role_policy.task_execution_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| collection\_name | The data.world collection name (typically a human-friendly version of the app or database name) | `string` | n/a | yes |
| credentials\_identifier | Identifies the subpath, within /data-world-crawler/, where credentials are stored; defaults to `identifier` | `string` | `""` | no |
| database | Database name; defaults to `identifier`. (For oracle, this indicates the SID.) | `string` | `""` | no |
| database\_type | Database type (postgresql, mysql, oracle, or bigquery) | `string` | n/a | yes |
| dataset | The dataset name (for bigquery) | `string` | `""` | no |
| env | Environment (prod, stage, lab). Defines which ecs cluster to run in. | `string` | n/a | yes |
| host | Database host (for postgresql, mysql, or oracle) | `string` | `""` | no |
| identifier | Application Identifier (most often the github repo name) | `string` | n/a | yes |
| org\_name | The data.world org name (typically cru-data, but sometimes different per ministry) | `string` | `"cru-data"` | no |
| project\_id | The id of the GCP project housing the dataset (for bigquery) | `string` | `""` | no |
| schedule\_expression | An AWS cloudwatch event [schedule expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html) to define when to run the crawler | `string` | `"rate(7 days)"` | no |
| schema | Database schema (for postgresql, mysql, or oracle) | `string` | `"public"` | no |

## Outputs

No outputs.
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
