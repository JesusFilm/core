aws iam create-policy --policy-name "AllowExternalDNSUpdates" --policy-document file://policy.json
aws iam attach-role-policy --role-name terraform-eks-node-stage --policy-arn arn:aws:iam::410965620680:policy/AllowExternalDNSUpdates
aws iam attach-role-policy --role-name terraform-eks-node-prod --policy-arn arn:aws:iam::410965620680:policy/AllowExternalDNSUpdates
helm repo add external-dns https://kubernetes-sigs.github.io/external-dns/
helm upgrade --install external-dns external-dns/external-dns --values values.yaml
eksctl create iamserviceaccount \
  --cluster jfp-eks-stage \
  --name "external-dns" \
  --namespace "default" \
  --attach-policy-arn arn:aws:iam::410965620680:policy/AllowExternalDNSUpdates \
  --approve