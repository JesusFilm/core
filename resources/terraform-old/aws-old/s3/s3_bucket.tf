resource "aws_s3_bucket" "tfer--nextsteps-arangodb-backup" {
  arn           = "arn:aws:s3:::nextsteps-arangodb-backup"
  bucket        = "nextsteps-arangodb-backup"
  force_destroy = "false"

  grant {
    id          = "73bd004ec1b6b8d1d4dfad9cdb1424b3fdd8ab5ada20f433b31a6d9bba760d40"
    permissions = ["FULL_CONTROL"]
    type        = "CanonicalUser"
  }

  hosted_zone_id      = "Z2O1EMRO9K5GLX"
  object_lock_enabled = "false"
  request_payer       = "BucketOwner"

  versioning {
    enabled    = "false"
    mfa_delete = "false"
  }
}
