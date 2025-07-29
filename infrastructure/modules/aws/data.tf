data "aws_acm_certificate" "acm_nextstep_is" {
  domain = "*.nextstep.is"
}

data "aws_acm_certificate" "acm_core_arclight_org" {
  domain = "core.arclight.org"
}

data "aws_acm_certificate" "acm_core_stage_arclight_org" {
  domain = "core-stage.arclight.org"
}

data "aws_acm_certificate" "acm_arclight_org" {
  domain = "arclight.org"
}
