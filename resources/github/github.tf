locals {
  users = {
    "charliepixegon"         = "owner"
    "csiyang"                = "member"
    "dkjensen"               = "member"
    "gdub01"                 = "owner"
    "GeronimoJohn"           = "member"
    "jessie-eaton"           = "owner"
    "jianwei1"               = "member"
    "lumberman"              = "member"
    "mikeallisonJS"          = "member"
    "moreleycb"              = "member"
    "murphomatic"            = "member"
    "stevendiller"           = "member"
    "storyworks"             = "member"
    "SwayCiaramelloCru"      = "owner"
    "tataihono"              = "owner"    
  }
}

resource "github_membership" "members" {
  for_each = local.users
  username = each.key
  role     = each.value
}
