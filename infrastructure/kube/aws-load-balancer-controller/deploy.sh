aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
eksctl utils associate-iam-oidc-provider --cluster jfp-eks-prod --approve
eksctl create iamserviceaccount \
  --cluster=jfp-eks-prod \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::410965620680:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve    
