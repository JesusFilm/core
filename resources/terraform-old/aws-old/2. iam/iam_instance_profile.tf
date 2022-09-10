resource "aws_iam_instance_profile" "tfer--Arclight-Cache-Clearer" {
  name = "Arclight-Cache-Clearer"
  path = "/"
  role = "Arclight-Cache-Clearer"
}

resource "aws_iam_instance_profile" "tfer--Arclight-Config-Fetcher" {
  name = "Arclight-Config-Fetcher"
  path = "/"
  role = "Arclight-Config-Fetcher"
}

resource "aws_iam_instance_profile" "tfer--DataPipelineDefaultResourceRole" {
  name = "DataPipelineDefaultResourceRole"
  path = "/"
  role = "DataPipelineDefaultResourceRole"
}

resource "aws_iam_instance_profile" "tfer--EMR_EC2_DefaultRole" {
  name = "EMR_EC2_DefaultRole"
  path = "/"
  role = "EMR_EC2_DefaultRole"
}

resource "aws_iam_instance_profile" "tfer--JesusFilmCoreEKSWorkerNodeRole" {
  name = "JesusFilmCoreEKSWorkerNodeRole"
  path = "/"
  role = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_instance_profile" "tfer--apollo-gateway-instance-iam-profile-prod" {
  name = "apollo-gateway-instance-iam-profile-prod"
  path = "/"
  role = "core-apollo-gateway"
}

resource "aws_iam_instance_profile" "tfer--apollo-gateway-instance-iam-profile-stage" {
  name = "apollo-gateway-instance-iam-profile-stage"
  path = "/"
  role = "core-apollo-gateway"
}

resource "aws_iam_instance_profile" "tfer--aws-elasticbeanstalk-ec2-role" {
  name = "aws-elasticbeanstalk-ec2-role"
  path = "/"
  role = "aws-elasticbeanstalk-ec2-role"
}

resource "aws_iam_instance_profile" "tfer--core-apollo-gateway" {
  name = "core-apollo-gateway"
  path = "/"
  role = "core-apollo-gateway"
}

resource "aws_iam_instance_profile" "tfer--ecsInstanceRole" {
  name = "ecsInstanceRole"
  path = "/"
  role = "ecsInstanceRole"
}

resource "aws_iam_instance_profile" "tfer--eks-44c0982c-e213-b4b9-339a-f2fe936b5f86" {
  name = "eks-44c0982c-e213-b4b9-339a-f2fe936b5f86"
  path = "/"
  role = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_instance_profile" "tfer--eks-acc0982c-86db-4719-77b5-b8974aeb2772" {
  name = "eks-acc0982c-86db-4719-77b5-b8974aeb2772"
  path = "/"
  role = "JesusFilmCoreEKSWorkerNodeRole"
}
