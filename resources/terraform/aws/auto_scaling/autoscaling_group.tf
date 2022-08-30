resource "aws_autoscaling_group" "tfer--eks-API-44c0982c-e213-b4b9-339a-f2fe936b5f86" {
  availability_zones        = ["us-east-2a", "us-east-2b", "us-east-2c"]
  capacity_rebalance        = "true"
  default_cooldown          = "300"
  default_instance_warmup   = "0"
  desired_capacity          = "3"
  force_delete              = "false"
  health_check_grace_period = "15"
  health_check_type         = "EC2"
  max_instance_lifetime     = "0"
  max_size                  = "6"
  metrics_granularity       = "1Minute"
  min_size                  = "3"

  mixed_instances_policy {
    instances_distribution {
      on_demand_allocation_strategy            = "prioritized"
      on_demand_base_capacity                  = "0"
      on_demand_percentage_above_base_capacity = "100"
      spot_allocation_strategy                 = "lowest-price"
      spot_instance_pools                      = "2"
    }

    launch_template {
      launch_template_specification {
        launch_template_id   = "lt-00b7269aea48aae2f"
        launch_template_name = "eks-44c0982c-e213-b4b9-339a-f2fe936b5f86"
        version              = "1"
      }

      override {
        instance_type = "t3.medium"
      }
    }
  }

  name                    = "eks-API-44c0982c-e213-b4b9-339a-f2fe936b5f86"
  protect_from_scale_in   = "false"
  service_linked_role_arn = "arn:aws:iam::894231352815:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling"

  tag {
    key                 = "eks:cluster-name"
    propagate_at_launch = "true"
    value               = "JesusFilm-core"
  }

  tag {
    key                 = "eks:nodegroup-name"
    propagate_at_launch = "true"
    value               = "API"
  }

  tag {
    key                 = "k8s.io/cluster-autoscaler/JesusFilm-core"
    propagate_at_launch = "true"
    value               = "owned"
  }

  tag {
    key                 = "k8s.io/cluster-autoscaler/enabled"
    propagate_at_launch = "true"
    value               = "true"
  }

  tag {
    key                 = "kubernetes.io/cluster/JesusFilm-core"
    propagate_at_launch = "true"
    value               = "owned"
  }

  termination_policies      = ["AllocationStrategy", "OldestInstance", "OldestLaunchTemplate"]
  vpc_zone_identifier       = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]
  wait_for_capacity_timeout = "10m"
}

resource "aws_autoscaling_group" "tfer--eks-ArangoDB-acc0982c-86db-4719-77b5-b8974aeb2772" {
  availability_zones        = ["us-east-2a", "us-east-2b", "us-east-2c"]
  capacity_rebalance        = "true"
  default_cooldown          = "300"
  default_instance_warmup   = "0"
  desired_capacity          = "2"
  force_delete              = "false"
  health_check_grace_period = "15"
  health_check_type         = "EC2"
  max_instance_lifetime     = "0"
  max_size                  = "4"
  metrics_granularity       = "1Minute"
  min_size                  = "2"

  mixed_instances_policy {
    instances_distribution {
      on_demand_allocation_strategy            = "prioritized"
      on_demand_base_capacity                  = "0"
      on_demand_percentage_above_base_capacity = "100"
      spot_allocation_strategy                 = "lowest-price"
      spot_instance_pools                      = "2"
    }

    launch_template {
      launch_template_specification {
        launch_template_id   = "lt-044598351a93c44d1"
        launch_template_name = "eks-acc0982c-86db-4719-77b5-b8974aeb2772"
        version              = "1"
      }

      override {
        instance_type = "i3.large"
      }
    }
  }

  name                    = "eks-ArangoDB-acc0982c-86db-4719-77b5-b8974aeb2772"
  protect_from_scale_in   = "false"
  service_linked_role_arn = "arn:aws:iam::894231352815:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling"

  tag {
    key                 = "eks:cluster-name"
    propagate_at_launch = "true"
    value               = "JesusFilm-core"
  }

  tag {
    key                 = "eks:nodegroup-name"
    propagate_at_launch = "true"
    value               = "ArangoDB"
  }

  tag {
    key                 = "k8s.io/cluster-autoscaler/JesusFilm-core"
    propagate_at_launch = "true"
    value               = "owned"
  }

  tag {
    key                 = "k8s.io/cluster-autoscaler/enabled"
    propagate_at_launch = "true"
    value               = "true"
  }

  tag {
    key                 = "kubernetes.io/cluster/JesusFilm-core"
    propagate_at_launch = "true"
    value               = "owned"
  }

  termination_policies      = ["AllocationStrategy", "OldestInstance", "OldestLaunchTemplate"]
  vpc_zone_identifier       = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]
  wait_for_capacity_timeout = "10m"
}
