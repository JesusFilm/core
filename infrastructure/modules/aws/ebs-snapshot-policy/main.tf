# Bounded EBS snapshot retention for Kubernetes PVC-backed volumes, enforced by
# AWS Data Lifecycle Manager (DLM) rather than by an in-cluster snapshot
# schedule. DLM policies survive Helm chart upgrades and are visible in the AWS
# console next to the Cost Explorer numbers they exist to control.
#
# Both environments share one AWS account and the same PVC names, so a DLM
# policy cannot tell prod volumes from stage volumes by the tags the EBS CSI
# driver writes. This module therefore finds the volumes for one cluster (by
# PVC name and by attachment to that cluster's nodes), tags them with a policy
# tag, and points the DLM policy at that tag.

locals {
  policy_name    = "jfp-dlm-${var.name}-${var.env}"
  target_tag_key = "SnapshotPolicy"
}

data "aws_instances" "cluster_nodes" {
  instance_tags = {
    "eks:cluster-name" = var.cluster_name
  }
  instance_state_names = ["running"]
}

data "aws_ebs_volumes" "targets" {
  filter {
    name   = "tag:kubernetes.io/created-for/pvc/name"
    values = var.pvc_names
  }

  filter {
    name   = "attachment.instance-id"
    values = data.aws_instances.cluster_nodes.ids
  }

  lifecycle {
    precondition {
      condition     = length(data.aws_instances.cluster_nodes.ids) > 0
      error_message = "No running EC2 instances tagged eks:cluster-name=${var.cluster_name}; cannot locate the volumes to snapshot."
    }
  }
}

resource "aws_ec2_tag" "target" {
  for_each = toset(data.aws_ebs_volumes.targets.ids)

  resource_id = each.value
  key         = local.target_tag_key
  value       = local.policy_name
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["dlm.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "dlm" {
  name               = local.policy_name
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  tags = {
    Name = local.policy_name
    Env  = var.env
  }
}

resource "aws_iam_role_policy_attachment" "dlm" {
  role       = aws_iam_role.dlm.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSDataLifecycleManagerServiceRole"
}

resource "aws_dlm_lifecycle_policy" "this" {
  # DLM only accepts [0-9A-Za-z _-] in a description, so anything else
  # (dots in a PVC name, for instance) is replaced with a hyphen.
  description        = replace("${local.policy_name} EBS snapshots of ${join(" ", var.pvc_names)} on ${var.cluster_name}", "/[^0-9A-Za-z _-]/", "-")
  execution_role_arn = aws_iam_role.dlm.arn
  state              = "ENABLED"

  policy_details {
    resource_types = ["VOLUME"]

    target_tags = {
      (local.target_tag_key) = local.policy_name
    }

    dynamic "schedule" {
      for_each = var.schedules

      content {
        name      = schedule.value.name
        copy_tags = true

        create_rule {
          cron_expression = schedule.value.cron_expression
        }

        retain_rule {
          count = schedule.value.retain_count
        }

        tags_to_add = {
          Name           = "${local.policy_name}-${schedule.value.name}"
          Env            = var.env
          SnapshotPolicy = local.policy_name
        }
      }
    }
  }

  tags = {
    Name = local.policy_name
    Env  = var.env
  }

  lifecycle {
    precondition {
      condition     = length(data.aws_ebs_volumes.targets.ids) > 0
      error_message = "No volumes with PVC name in [${join(", ", var.pvc_names)}] are attached to ${var.cluster_name} nodes. If the workload is down, wait for it to come back rather than applying: applying now would untag the volumes and the policy would snapshot nothing."
    }
  }
}
