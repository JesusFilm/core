module "kms_key" {
  source = "../../../modules/aws/kms/key"
  name                    = "alias/application/${local.identifier}"
  description             = "Encryption key for ${local.identifier}"
  deletion_window_in_days = "10"
  key_tags                = local.tags
}
