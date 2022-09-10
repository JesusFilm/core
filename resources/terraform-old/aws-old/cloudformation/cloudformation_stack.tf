resource "aws_cloudformation_stack" "tfer--eksctl-JesusFilm-core-addon-iamserviceaccount-default-external-dns" {
  capabilities     = ["CAPABILITY_IAM"]
  disable_rollback = "false"
  name             = "eksctl-JesusFilm-core-addon-iamserviceaccount-default-external-dns"

  tags = {
    "alpha.eksctl.io/cluster-name"                = "JesusFilm-core"
    "alpha.eksctl.io/eksctl-version"              = "0.100.0"
    "alpha.eksctl.io/iamserviceaccount-name"      = "default/external-dns"
    "eksctl.cluster.k8s.io/v1alpha1/cluster-name" = "JesusFilm-core"
  }

  tags_all = {
    "alpha.eksctl.io/cluster-name"                = "JesusFilm-core"
    "alpha.eksctl.io/eksctl-version"              = "0.100.0"
    "alpha.eksctl.io/iamserviceaccount-name"      = "default/external-dns"
    "eksctl.cluster.k8s.io/v1alpha1/cluster-name" = "JesusFilm-core"
  }

  template_body      = "{\"AWSTemplateFormatVersion\":\"2010-09-09\",\"Description\":\"IAM role for serviceaccount \\\"default/external-dns\\\" [created and managed by eksctl]\",\"Outputs\":{\"Role1\":{\"Value\":{\"Fn::GetAtt\":\"Role1.Arn\"}}},\"Resources\":{\"Role1\":{\"Properties\":{\"AssumeRolePolicyDocument\":{\"Statement\":[{\"Action\":[\"sts:AssumeRoleWithWebIdentity\"],\"Condition\":{\"StringEquals\":{\"oidc.eks.us-east-2.amazonaws.com/id/54A242E78E43553E2574158527ABE3E6:aud\":\"sts.amazonaws.com\",\"oidc.eks.us-east-2.amazonaws.com/id/54A242E78E43553E2574158527ABE3E6:sub\":\"system:serviceaccount:default:external-dns\"}},\"Effect\":\"Allow\",\"Principal\":{\"Federated\":\"arn:aws:iam::894231352815:oidc-provider/oidc.eks.us-east-2.amazonaws.com/id/54A242E78E43553E2574158527ABE3E6\"}}],\"Version\":\"2012-10-17\"},\"ManagedPolicyArns\":[\"arn:aws:iam::894231352815:policy/AllowExternalDNSUpdates\"]},\"Type\":\"AWS::IAM::Role\"}}}"
  timeout_in_minutes = "0"
}
