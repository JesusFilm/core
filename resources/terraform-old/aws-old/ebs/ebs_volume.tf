resource "aws_ebs_volume" "tfer--vol-00ba6d6dc435f1fae" {
  availability_zone    = "us-east-2c"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "20"

  tags = {
    Name                                      = "kubernetes-dynamic-pvc-49eb07ee-322a-49d1-8cd2-2f8578ffd94c"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-49eb07ee-322a-49d1-8cd2-2f8578ffd94c"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-single-xpien1ul"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  tags_all = {
    Name                                      = "kubernetes-dynamic-pvc-49eb07ee-322a-49d1-8cd2-2f8578ffd94c"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-49eb07ee-322a-49d1-8cd2-2f8578ffd94c"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-single-xpien1ul"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-01fef79fc47d821ef" {
  availability_zone    = "us-east-2c"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "20"

  tags = {
    Name                                              = "kubernetes-dynamic-pvc-08f2f7f6-8f88-4bb3-b298-ce174fdca0ef"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-08f2f7f6-8f88-4bb3-b298-ce174fdca0ef"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-single-wzvhtgaj"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  tags_all = {
    Name                                              = "kubernetes-dynamic-pvc-08f2f7f6-8f88-4bb3-b298-ce174fdca0ef"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-08f2f7f6-8f88-4bb3-b298-ce174fdca0ef"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-single-wzvhtgaj"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-02626c1a99b0a2048" {
  availability_zone    = "us-east-2c"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "8"

  tags = {
    Name                                      = "kubernetes-dynamic-pvc-10adb4bb-136c-472a-b301-4db933c16e26"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-10adb4bb-136c-472a-b301-4db933c16e26"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-agent-raqb8dat"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  tags_all = {
    Name                                      = "kubernetes-dynamic-pvc-10adb4bb-136c-472a-b301-4db933c16e26"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-10adb4bb-136c-472a-b301-4db933c16e26"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-agent-raqb8dat"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-03bf55fd3bea1e951" {
  availability_zone    = "us-east-2b"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "8"

  tags = {
    Name                                              = "kubernetes-dynamic-pvc-3acbb181-c896-488a-a9bf-f997bfaf80b8"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-3acbb181-c896-488a-a9bf-f997bfaf80b8"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-single-jn1gg12b"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  tags_all = {
    Name                                              = "kubernetes-dynamic-pvc-3acbb181-c896-488a-a9bf-f997bfaf80b8"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-3acbb181-c896-488a-a9bf-f997bfaf80b8"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-single-jn1gg12b"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-05dfcbdb9215fdac1" {
  availability_zone    = "us-east-2a"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "8"

  tags = {
    Name                                              = "kubernetes-dynamic-pvc-ed2b8e1a-973b-4f5f-a928-390eb980056f"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-ed2b8e1a-973b-4f5f-a928-390eb980056f"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-agent-txipeu6t"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  tags_all = {
    Name                                              = "kubernetes-dynamic-pvc-ed2b8e1a-973b-4f5f-a928-390eb980056f"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-ed2b8e1a-973b-4f5f-a928-390eb980056f"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-agent-txipeu6t"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-061db25c66f8aab20" {
  availability_zone    = "us-east-2b"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "20"

  tags = {
    Name                                      = "kubernetes-dynamic-pvc-0d8f8556-49b8-4f72-9a56-11b78d9379f0"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-0d8f8556-49b8-4f72-9a56-11b78d9379f0"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-single-zatsw0uk"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  tags_all = {
    Name                                      = "kubernetes-dynamic-pvc-0d8f8556-49b8-4f72-9a56-11b78d9379f0"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-0d8f8556-49b8-4f72-9a56-11b78d9379f0"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-single-zatsw0uk"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-08c1d65615aaa6461" {
  availability_zone    = "us-east-2b"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "20"

  tags = {
    Name                                              = "kubernetes-dynamic-pvc-f1b47c04-5045-4f1c-9047-8144b94e30bb"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-f1b47c04-5045-4f1c-9047-8144b94e30bb"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-single-sidyn0wk"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  tags_all = {
    Name                                              = "kubernetes-dynamic-pvc-f1b47c04-5045-4f1c-9047-8144b94e30bb"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-f1b47c04-5045-4f1c-9047-8144b94e30bb"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-single-sidyn0wk"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-08cdc64fe956a2e7b" {
  availability_zone    = "us-east-2c"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "8"

  tags = {
    Name                                      = "kubernetes-dynamic-pvc-9a489d4c-221b-4e11-9fbc-6bcb516347f6"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-9a489d4c-221b-4e11-9fbc-6bcb516347f6"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-agent-5vqbwjd0"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  tags_all = {
    Name                                      = "kubernetes-dynamic-pvc-9a489d4c-221b-4e11-9fbc-6bcb516347f6"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-9a489d4c-221b-4e11-9fbc-6bcb516347f6"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-agent-5vqbwjd0"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-08f2cdcc41aedd672" {
  availability_zone    = "us-east-2b"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "8"

  tags = {
    Name                                      = "kubernetes-dynamic-pvc-5121a995-8f84-4778-a6cd-a18af7928194"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-5121a995-8f84-4778-a6cd-a18af7928194"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-agent-5rpkbvze"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  tags_all = {
    Name                                      = "kubernetes-dynamic-pvc-5121a995-8f84-4778-a6cd-a18af7928194"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-5121a995-8f84-4778-a6cd-a18af7928194"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-agent-5rpkbvze"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-0c4309f71e794130b" {
  availability_zone    = "us-east-2c"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "8"

  tags = {
    Name                                              = "kubernetes-dynamic-pvc-573eb073-5d56-4417-92ba-eeb81daaf428"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-573eb073-5d56-4417-92ba-eeb81daaf428"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-agent-ri6vohev"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  tags_all = {
    Name                                              = "kubernetes-dynamic-pvc-573eb073-5d56-4417-92ba-eeb81daaf428"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-573eb073-5d56-4417-92ba-eeb81daaf428"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-agent-ri6vohev"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-0c7d801c44909b34f" {
  availability_zone    = "us-east-2c"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "20"

  tags = {
    Name                                      = "kubernetes-dynamic-pvc-df6b3e89-c85e-49f0-a827-bc8c2f9f2f9f"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-df6b3e89-c85e-49f0-a827-bc8c2f9f2f9f"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-stage-single-3uwrqtu4"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  tags_all = {
    Name                                      = "kubernetes-dynamic-pvc-df6b3e89-c85e-49f0-a827-bc8c2f9f2f9f"
    "kubernetes.io/cluster/JesusFilm-core"    = "owned"
    "kubernetes.io/created-for/pv/name"       = "pvc-df6b3e89-c85e-49f0-a827-bc8c2f9f2f9f"
    "kubernetes.io/created-for/pvc/name"      = "arangodb-stage-single-3uwrqtu4"
    "kubernetes.io/created-for/pvc/namespace" = "default"
  }

  throughput = "0"
  type       = "gp2"
}

resource "aws_ebs_volume" "tfer--vol-0e71e1684ccb0733d" {
  availability_zone    = "us-east-2b"
  encrypted            = "false"
  iops                 = "100"
  multi_attach_enabled = "false"
  size                 = "8"

  tags = {
    Name                                              = "kubernetes-dynamic-pvc-b0443a74-0e4f-463f-a77d-ee717b13881d"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-b0443a74-0e4f-463f-a77d-ee717b13881d"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-agent-jyhrnxvz"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  tags_all = {
    Name                                              = "kubernetes-dynamic-pvc-b0443a74-0e4f-463f-a77d-ee717b13881d"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/created-for/pv/name"               = "pvc-b0443a74-0e4f-463f-a77d-ee717b13881d"
    "kubernetes.io/created-for/pvc/name"              = "arangodb-agent-jyhrnxvz"
    "kubernetes.io/created-for/pvc/namespace"         = "default"
  }

  throughput = "0"
  type       = "gp2"
}
