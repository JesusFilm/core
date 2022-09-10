resource "kubernetes_manifest" "storageclass_ebs_sc" {
  manifest = {
    "allowedTopologies" = [
      {
        "matchLabelExpressions" = [
          {
            "key" = "topology.ebs.csi.aws.com/zone"
            "values" = [
              "us-east-2",
            ]
          },
        ]
      },
    ]
    "apiVersion" = "storage.k8s.io/v1"
    "kind" = "StorageClass"
    "metadata" = {
      "name" = "ebs-sc"
    }
    "parameters" = {
      "csi.storage.k8s.io/fstype" = "xfs"
      "encrypted" = "false"
      "iopsPerGB" = "50"
      "type" = "io1"
    }
    "provisioner" = "ebs.csi.aws.com"
    "volumeBindingMode" = "WaitForFirstConsumer"
  }
}