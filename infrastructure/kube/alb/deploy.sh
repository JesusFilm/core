helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
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
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=jfp-eks-prod \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-east-2 \
  --set vpcId=vpc-0b722b0a1f7789afd \
  --kube-context=prod