resource "aws_eks_node_group" "tfer--API" {
  ami_type       = "AL2_x86_64"
  capacity_type  = "ON_DEMAND"
  cluster_name   = "${aws_eks_cluster.tfer--JesusFilm-core.name}"
  disk_size      = "20"
  instance_types = ["t3.medium"]

  labels = {
    type = "api"
  }

  node_group_name = "API"
  node_role_arn   = "arn:aws:iam::894231352815:role/JesusFilmCoreEKSWorkerNodeRole"
  release_version = "1.21.12-20220526"

  scaling_config {
    desired_size = "3"
    max_size     = "6"
    min_size     = "3"
  }

  subnet_ids = ["subnet-305d917d", "subnet-4d17ab36", "subnet-bb4432d2"]

  update_config {
    max_unavailable = "1"
  }

  version = "1.21"
}

resource "aws_eks_node_group" "tfer--ArangoDB" {
  ami_type       = "AL2_x86_64"
  capacity_type  = "ON_DEMAND"
  cluster_name   = "${aws_eks_cluster.tfer--JesusFilm-core.name}"
  disk_size      = "20"
  instance_types = ["i3.large"]

  labels = {
    type = "database"
  }

  node_group_name = "ArangoDB"
  node_role_arn   = "arn:aws:iam::894231352815:role/JesusFilmCoreEKSWorkerNodeRole"
  release_version = "1.21.12-20220526"

  scaling_config {
    desired_size = "2"
    max_size     = "4"
    min_size     = "2"
  }

  subnet_ids = ["subnet-305d917d", "subnet-4d17ab36", "subnet-bb4432d2"]

  update_config {
    max_unavailable = "1"
  }

  version = "1.21"
}
