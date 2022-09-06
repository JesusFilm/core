resource "aws_iam_user" "tfer--AIDA5ANCXSXX4JQBDVGDY" {
  force_destroy = "false"
  name          = "JfmGithubUser"
  path          = "/"
}

resource "aws_iam_user" "tfer--AIDA5ANCXSXX4MXPXQP3P" {
  force_destroy = "false"
  name          = "tataihono.nikora@cru.org"
  path          = "/"
}

resource "aws_iam_user" "tfer--AIDA5ANCXSXX7NELEGOBS" {
  force_destroy = "false"
  name          = "JFM-NextStep-New-ME2"
  path          = "/"
}

resource "aws_iam_user" "tfer--AIDA5ANCXSXXU4G2523D4" {
  force_destroy = "false"
  name          = "jfm_data_export_s3"
  path          = "/"

  tags = {
    project = "next_step"
  }

  tags_all = {
    project = "next_step"
  }
}

resource "aws_iam_user" "tfer--AIDA5ANCXSXXW3JDWSWNK" {
  force_destroy = "false"
  name          = "dj.mikeallison@gmail.com"
  path          = "/"
}

resource "aws_iam_user" "tfer--AIDAIGMPADJU5QF6Y2F2K" {
  force_destroy = "false"
  name          = "GavinWalsh"
  path          = "/"
}

resource "aws_iam_user" "tfer--AIDAIWZHEWOUSC2ZAI6DY" {
  force_destroy = "false"
  name          = "jfm-profiles"
  path          = "/"
}
