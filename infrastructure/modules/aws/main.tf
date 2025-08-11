module "vpc" {
  source = "./vpc"
  env    = var.env
  cidr   = var.cidr
}

module "internal_alb_security_group" {
  source        = "./security-group"
  name          = "jfp-internal-alb-sg-${var.env}"
  vpc_id        = module.vpc.vpc_id
  ingress_rules = local.internal_alb_config.ingress_rules
  egress_rules  = local.internal_alb_config.egress_rules
}

module "internal_rds_security_group" {
  source = "./security-group"
  name   = "jfp-internal-rds-sg-${var.env}"
  vpc_id = module.vpc.vpc_id
  ingress_rules = [
    {
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      cidr_blocks = [var.cidr]
    }
  ]
  egress_rules = local.egress_rules
}

module "public_alb_security_group" {
  source        = "./security-group"
  name          = "jfp-public-alb-sg-${var.env}"
  vpc_id        = module.vpc.vpc_id
  ingress_rules = local.public_alb_config.ingress_rules
  egress_rules  = local.public_alb_config.egress_rules
}

module "public_bastion_security_group" {
  source = "./security-group"
  name   = "jfp-public-bastion-sg-${var.env}"
  vpc_id = module.vpc.vpc_id
  ingress_rules = [
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = concat([var.cidr], local.google_datastream_ip_list)
    },
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["172.221.20.111/32"]
    },
    {
      // Mike Allison
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["16.203.137.254/32"]
    },
    {
      // Tataihono Nikora
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["203.86.193.21/32"]
    },

    // EC2_INSTANCE_CONNECT
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["3.16.146.0/29"]
    }
  ]
  egress_rules = local.egress_rules
}

module "internal_alb" {
  source              = "./alb"
  name                = "jfp-internal-alb-${var.env}"
  subnets             = module.vpc.internal_subnets
  vpc_id              = module.vpc.vpc_id
  internal            = true
  security_groups     = [module.internal_alb_security_group.security_group_id]
  access_logs_enabled = true
  access_logs_bucket  = aws_s3_bucket.internal_alb_logs.bucket
  access_logs_prefix  = ""
}

module "internal_alb_listener" {
  source   = "./alb-listener"
  alb_arn  = module.internal_alb.arn
  port     = 80
  protocol = "HTTP"
}

module "public_alb" {
  source              = "./alb"
  name                = "jfp-public-alb-${var.env}"
  subnets             = module.vpc.public_subnets
  vpc_id              = module.vpc.vpc_id
  internal            = false
  redirects           = local.public_alb_config.redirects
  security_groups     = [module.public_alb_security_group.security_group_id]
  access_logs_enabled = true
  access_logs_bucket  = aws_s3_bucket.public_alb_logs.bucket
  access_logs_prefix  = ""
}

module "public_alb_listener" {
  source          = "./alb-listener"
  alb_arn         = module.public_alb.arn
  port            = 443
  protocol        = "HTTPS"
  certificate_arn = var.certificate_arn
}
resource "aws_lb_listener" "ssl_forwarder" {
  load_balancer_arn = module.public_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener_certificate" "acm_nextstep_is" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_nextstep_is.arn
}

resource "aws_lb_listener_certificate" "acm_core_arclight_org" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_core_arclight_org.arn
}

resource "aws_lb_listener_certificate" "acm_core_stage_arclight_org" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_core_stage_arclight_org.arn
}

resource "aws_lb_listener_certificate" "acm_arclight_org" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_arclight_org.arn
}

resource "aws_lb_listener_certificate" "acm_arc_gt" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_arc_gt.arn
}

module "route53_private_zone" {
  source            = "./route53"
  internal_url_name = var.internal_url_name
  alb               = module.internal_alb
  vpc_id            = module.vpc.vpc_id
}

module "ecs" {
  source                      = "./ecs"
  name                        = "jfp-ecs-cluster-${var.env}"
  vpc_id                      = module.vpc.vpc_id
  internal_alb_security_group = module.internal_alb_security_group
  public_alb_security_group   = module.public_alb_security_group
  env                         = var.env
}

# S3 buckets for ALB access logs (public and internal)
resource "aws_s3_bucket" "public_alb_logs" {
  bucket = "jfp-public-alb-logs-${var.env}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name        = "Public ALB Access Logs"
    Environment = var.env
    Purpose     = "public-alb-logging"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "public_alb_logs" {
  bucket = aws_s3_bucket.public_alb_logs.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "public_alb_logs" {
  bucket = aws_s3_bucket.public_alb_logs.bucket

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "public_alb_logs" {
  bucket = aws_s3_bucket.public_alb_logs.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "public_alb_logs" {
  bucket = aws_s3_bucket.public_alb_logs.id
  rule {
    id     = "expire-logs"
    status = "Enabled"
    expiration { days = 90 }
  }
}

# S3 bucket for internal ALB access logs
resource "aws_s3_bucket" "internal_alb_logs" {
  bucket = "jfp-internal-alb-logs-${var.env}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name        = "Internal ALB Access Logs"
    Environment = var.env
    Purpose     = "internal-alb-logging"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "internal_alb_logs" {
  bucket = aws_s3_bucket.internal_alb_logs.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "internal_alb_logs" {
  bucket = aws_s3_bucket.internal_alb_logs.bucket

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "internal_alb_logs" {
  bucket = aws_s3_bucket.internal_alb_logs.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "internal_alb_logs" {
  bucket = aws_s3_bucket.internal_alb_logs.id
  rule {
    id     = "expire-logs"
    status = "Enabled"
    expiration { days = 90 }
  }
}

# Bucket policy for public ALB logs
resource "aws_s3_bucket_policy" "public_alb_logs" {
  bucket = aws_s3_bucket.public_alb_logs.bucket

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_elb_service_account.main.id}:root"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.public_alb_logs.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      },
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/datadog-log-forwarder"
        }
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.public_alb_logs.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
      }
    ]
  })
}

# Bucket policy for internal ALB logs
resource "aws_s3_bucket_policy" "internal_alb_logs" {
  bucket = aws_s3_bucket.internal_alb_logs.bucket

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_elb_service_account.main.id}:root"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.internal_alb_logs.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      },
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/datadog-log-forwarder"
        }
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.internal_alb_logs.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
      }
    ]
  })
}

# Permission for S3 to invoke Datadog Lambda for public ALB logs
resource "aws_lambda_permission" "allow_s3_public_alb_logs" {
  statement_id  = "AllowS3PublicALBLogs"
  action        = "lambda:InvokeFunction"
  function_name = var.datadog_forwarder_lambda_arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.public_alb_logs.arn
}

# Permission for S3 to invoke Datadog Lambda for internal ALB logs
resource "aws_lambda_permission" "allow_s3_internal_alb_logs" {
  statement_id  = "AllowS3InternalALBLogs"
  action        = "lambda:InvokeFunction"
  function_name = var.datadog_forwarder_lambda_arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.internal_alb_logs.arn
}

# S3 bucket notification for public ALB logs
resource "aws_s3_bucket_notification" "public_alb_logs" {
  bucket = aws_s3_bucket.public_alb_logs.bucket

  lambda_function {
    lambda_function_arn = var.datadog_forwarder_lambda_arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "AWSLogs/"
    filter_suffix       = ".gz"
  }

  depends_on = [aws_lambda_permission.allow_s3_public_alb_logs]
}

# S3 bucket notification for internal ALB logs
resource "aws_s3_bucket_notification" "internal_alb_logs" {
  bucket = aws_s3_bucket.internal_alb_logs.bucket

  lambda_function {
    lambda_function_arn = var.datadog_forwarder_lambda_arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "AWSLogs/"
    filter_suffix       = ".gz"
  }

  depends_on = [aws_lambda_permission.allow_s3_internal_alb_logs]
}
