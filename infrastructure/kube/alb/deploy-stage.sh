helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
eksctl utils associate-iam-oidc-provider --cluster jfp-eks-stage --approve
eksctl create iamserviceaccount \
  --cluster=jfp-eks-stage \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRoleStage \
  --attach-policy-arn=arn:aws:iam::410965620680:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve    
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=jfp-eks-stage \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-east-2 \
  --set vpcId=vpc-08eeff0fe23f23079 \
  --kube-context=stage