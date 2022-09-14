resource "aws_acm_certificate" "tfer--15347d85-a737-49a7-8b2f-0b060df6f1d1_-002A--002E-core-002E-jesusfilm-002E-org" {
  domain_name = "*.central.jesusfilm.org"

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }

  subject_alternative_names = ["*.central.jesusfilm.org", "graphql-stage.jesusfilm.org", "graphql.jesusfilm.org"]

  tags = {
    group = "JesusFilm"
  }

  tags_all = {
    group = "JesusFilm"
  }

  validation_method = "DNS"
}
