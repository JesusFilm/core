eksctl create iamserviceaccount \
  --region us-east-2 \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster jfp-eks-stage \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --approve \
  --role-only \
  --role-name AmazonEKS_EBS_CSI_DriverRole_stage

eksctl create addon --name aws-ebs-csi-driver --cluster jfp-eks-stage --service-account-role-arn arn:aws:iam::410965620680:role/AmazonEKS_EBS_CSI_DriverRole_stage --force

kubectl apply -f deploy.yaml