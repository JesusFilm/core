eksctl utils associate-iam-oidc-provider --cluster jfp-eks-stage --approve
eksctl create iamserviceaccount \
  --cluster=jfp-eks-stage \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRoleStage \
  --attach-policy-arn=arn:aws:iam::410965620680:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve    
