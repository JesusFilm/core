# Existing managed add-ons are imported, not recreated. The module reads their
# current configuration and service-account role before updating the version.
import {
  to = module.stage.module.eks.aws_eks_addon.core["eks-node-monitoring-agent"]
  id = "jfp-eks-stage:eks-node-monitoring-agent"
}

import {
  for_each = local.upgrade.prod_addons ? toset(["eks-node-monitoring-agent", "aws-ebs-csi-driver"]) : toset([])
  to       = module.prod.module.eks.aws_eks_addon.core[each.key]
  id       = "jfp-eks-prod:${each.key}"
}
