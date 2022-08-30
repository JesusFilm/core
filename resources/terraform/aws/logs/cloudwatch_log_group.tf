resource "aws_cloudwatch_log_group" "tfer--JesusFilm-core" {
  name              = "JesusFilm-core"
  retention_in_days = "7"

  tags = {
    group = "JesusFilm"
  }

  tags_all = {
    group = "JesusFilm"
  }
}
