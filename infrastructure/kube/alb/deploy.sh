helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
eksctl create iamserviceaccount \
  --cluster=jfp-eks-prod \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::410965620680:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve    
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=jfp-eks-prod \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller 