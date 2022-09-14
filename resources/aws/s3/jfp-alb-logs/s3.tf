resource "aws_s3_bucket" "bucket" {
  bucket = local.identifier
  tags   = local.tags
}

resource "aws_s3_bucket_acl" "bucket" {
  bucket = aws_s3_bucket.bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_lifecycle_configuration" "bucket" {
  bucket = aws_s3_bucket.bucket.id
  rule {
    id     = "Expire old logs"
    status = "Enabled"
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
    expiration {
      days = 1825 # 5 years
    }
    noncurrent_version_expiration {
      noncurrent_days = 1
    }
  }
}

resource "aws_s3_bucket_public_access_block" "private" {
  bucket                  = aws_s3_bucket.bucket.id
  restrict_public_buckets = true
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
}

data "aws_iam_policy_document" "us_east_2_access_logging" {
  # Allows us-east-1 to write logs to the bucket.
  # See https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/enable-access-logs.html
  statement {
    effect = "Allow"
    principals {
      identifiers = ["arn:aws:iam::033677994240:root"] // us-east-2 region account
      type        = "AWS"
    }
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.bucket.arn}/*"]
  }

  statement {
    effect = "Allow"
    principals {
      identifiers = ["delivery.logs.amazonaws.com"]
      type        = "Service"
    }
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.bucket.arn}/*"]
    condition {
      test     = "StringEquals"
      values   = ["bucket-owner-full-control"]
      variable = "s3:x-amz-acl"
    }
  }

  statement {
    effect = "Allow"
    principals {
      identifiers = ["delivery.logs.amazonaws.com"]
      type        = "Service"
    }
    actions   = ["s3:GetBucketAcl"]
    resources = [aws_s3_bucket.bucket.arn]
  }
}

resource "aws_s3_bucket_policy" "access_logging" {
  bucket = aws_s3_bucket.bucket.id
  policy = data.aws_iam_policy_document.us_east_2_access_logging.json
}
