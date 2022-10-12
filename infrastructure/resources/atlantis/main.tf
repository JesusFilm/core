
resource "aws_iam_access_key" "jfp_terraform_user_access_key" {
  user = data.aws_iam_user.jfp_terraform_user.user_name
}

module "atlantis" {
  source  = "terraform-aws-modules/atlantis/aws"
  version = "~> 3.0"

  name = "atlantis"
  # user needed because of https://github.com/runatlantis/atlantis/issues/2221
  # this is atlantis user per the official docker image
  user = "100:1000"

  custom_environment_variables = [
    {
      name : "ATLANTIS_REPO_CONFIG_JSON",
      value : jsonencode(yamldecode(file("${path.module}/resources/atlantis/server-atlantis.yaml"))),
      }, {
      name : "AWS_ACCESS_KEY_ID"
      value : resource.aws_iam_access_key.jfp_terraform_user_access_key.id
      }, {
      name : "AWS_SECRET_ACCESS_KEY"
      value : resource.aws_iam_access_key.jfp_terraform_user_access_key.secret
    }
  ]

  # ephemeral storage, needed because the EFS storage
  # gets created with root-owned directories
  enable_ephemeral_storage = true

  # VPC
  vpc_id             = module.prod.vpc.id
  private_subnet_ids = module.prod.vpc.internal_subnets
  public_subnet_ids  = module.prod.vpc.public_subnets
  cidr               = var.cidr

  # DNS
  route53_zone_name = module.route53_central_jesusfilm_org.name

  # ACM
  certificate_arn = module.acm_central_jesusfilm_org.arn

  # ECS
  ecs_cluster_id = module.prod.ecs.ecs_cluster.id

  # Atlantis
  atlantis_github_user           = "jesus-film-bot"
  atlantis_github_user_token     = data.aws_ssm_parameter.atlantis_github_user_token.value
  atlantis_github_webhook_secret = data.aws_ssm_parameter.atlantis_github_webhook_secret.value
  atlantis_repo_allowlist        = ["github.com/JesusFilm/*"]

  # GitHub
  allow_unauthenticated_access = true
  allow_github_webhooks        = true
}
