output "aws_eks_cluster_tfer--JesusFilm-core_id" {
  value = "${aws_eks_cluster.tfer--JesusFilm-core.id}"
}

output "aws_eks_node_group_tfer--API_id" {
  value = "${aws_eks_node_group.tfer--API.id}"
}

output "aws_eks_node_group_tfer--ArangoDB_id" {
  value = "${aws_eks_node_group.tfer--ArangoDB.id}"
}
