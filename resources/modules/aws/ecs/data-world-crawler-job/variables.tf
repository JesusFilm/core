variable "identifier" {
  description = "Application Identifier (most often the github repo name)"
  type        = string
}

variable "env" {
  description = "Environment (prod, stage, lab). Defines which ecs cluster to run in."
  type        = string
}

variable "org_name" {
  description = "The data.world org name (typically cru-data, but sometimes different per ministry)"
  type        = string
  default     = "cru-data"
}

variable "collection_name" {
  description = "The data.world collection name (typically a human-friendly version of the app or database name)"
  type        = string
}


variable "database_type" {
  description = "Database type (postgresql, mysql, oracle, or bigquery)"
  type        = string
}

variable "host" {
  description = "Database host (for postgresql, mysql, or oracle)"
  type        = string
  default     = ""
}

variable "schema" {
  description = "Database schema (for postgresql, mysql, or oracle)"
  type        = string
  default     = "public"
}

variable "database" {
  description = "Database name; defaults to `identifier`. (For oracle, this indicates the SID.)"
  type        = string
  default     = ""
}

variable "project_id" {
  description = "The id of the GCP project housing the dataset (for bigquery)"
  type        = string
  default     = ""
}

variable "dataset" {
  description = "The dataset name (for bigquery)"
  type        = string
  default     = ""
}

variable "credentials_identifier" {
  description = "Identifies the subpath, within /data-world-crawler/, where credentials are stored; defaults to `identifier`"
  type        = string
  default     = ""
}

variable "schedule_expression" {
  description = "An AWS cloudwatch event [schedule expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html) to define when to run the crawler"
  type        = string
  default     = "rate(7 days)"
}
