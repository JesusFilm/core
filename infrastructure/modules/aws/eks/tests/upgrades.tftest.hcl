mock_provider "aws" {
  mock_resource "aws_iam_role" {
    defaults = {
      arn = "arn:aws:iam::123456789012:role/test-eks"
    }
  }
  mock_data "aws_eks_cluster" {
    defaults = { version = "1.32" }
  }
  mock_data "aws_eks_node_group" {
    defaults = { version = "1.32" }
  }
  mock_data "aws_eks_addon" {
    defaults = {
      configuration_values     = "{\"test\":true}"
      service_account_role_arn = "arn:aws:iam::123456789012:role/existing-monitoring"
    }
  }
}

variables {
  env                        = "stage"
  name                       = "test-eks"
  subnet_ids                 = ["subnet-00000000000000000"]
  subnet_ids_2a              = ["subnet-00000000000000000"]
  subnet_ids_2b              = ["subnet-00000000000000001"]
  subnet_ids_2c              = ["subnet-00000000000000002"]
  security_group_ids         = ["sg-00000000000000000"]
  vpc_id                     = "vpc-00000000000000000"
  enforce_sequential_upgrade = true
  node_ami_type              = "AL2023_x86_64_STANDARD"
  node_max_unavailable       = 1
}

run "allow_one_minor_and_preserve_capacity" {
  command = plan
  variables {
    cluster_version = "1.33"
    node_version    = "1.33"
    addons = {
      kube-proxy = { version = "v1.33.10-eksbuild.29" }
    }
  }
  assert {
    condition = (
      aws_eks_cluster.this.version == "1.33" &&
      aws_eks_node_group.az_2a_ondemand.version == "1.33" &&
      aws_eks_node_group.az_2a_ondemand.ami_type == "AL2023_x86_64_STANDARD" &&
      aws_eks_node_group.az_2a_ondemand.scaling_config[0].desired_size == 3 &&
      aws_eks_node_group.az_2a_ondemand.scaling_config[0].max_size == 5 &&
      aws_eks_node_group.az_2a_ondemand.update_config[0].max_unavailable == 1 &&
      aws_eks_addon.core["kube-proxy"].preserve &&
      aws_eks_addon.core["kube-proxy"].resolve_conflicts_on_update == "PRESERVE"
    )
    error_message = "A reviewed minor upgrade must preserve capacity, use AL2023 and preserve add-on configuration."
  }
}

run "reject_skipped_minor" {
  command = plan
  variables { cluster_version = "1.36" }
  expect_failures = [aws_eks_cluster.this]
}

run "reject_downgrade" {
  command = plan
  variables { cluster_version = "1.31" }
  expect_failures = [aws_eks_cluster.this]
}

run "reject_control_plane_before_workers_catch_up" {
  command = plan
  variables { cluster_version = "1.33" }
  override_data {
    target = data.aws_eks_node_group.live
    values = { version = "1.31" }
  }
  expect_failures = [aws_eks_cluster.this]
}

run "allow_worker_preparation_without_control_plane_upgrade" {
  command = plan
  variables {
    cluster_version = "1.32"
    node_version    = "1.32"
  }
  override_data {
    target = data.aws_eks_node_group.live
    values = { version = "1.31" }
  }
  assert {
    condition     = aws_eks_node_group.az_2a_ondemand.version == "1.32"
    error_message = "Worker alignment must be permitted before the next control-plane upgrade."
  }
}

run "preserve_existing_monitoring_configuration_and_iam_role" {
  command = plan
  variables {
    cluster_version = "1.32"
    addons = {
      eks-node-monitoring-agent = { version = "v1.4.0-eksbuild.2", existing = true }
    }
  }
  assert {
    condition = (
      aws_eks_addon.core["eks-node-monitoring-agent"].configuration_values == "{\"test\":true}" &&
      aws_eks_addon.core["eks-node-monitoring-agent"].service_account_role_arn == "arn:aws:iam::123456789012:role/existing-monitoring" &&
      aws_eks_addon.core["eks-node-monitoring-agent"].preserve
    )
    error_message = "Importing existing monitoring must preserve its configuration, IAM role and Kubernetes objects."
  }
}

run "reject_competing_ebs_csi_ownership" {
  command = plan
  variables {
    addons = {
      aws-ebs-csi-driver = { version = "v1.67.0-eksbuild.1", existing = true }
    }
  }
  expect_failures = [var.addons]
}
