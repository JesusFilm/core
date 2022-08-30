resource "aws_iam_instance_profile" "tfer--JesusFilmCoreEKSWorkerNodeRole" {
  name = "JesusFilmCoreEKSWorkerNodeRole"
  path = "/"
  role = "JesusFilmCoreEKSWorkerNodeRole"
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
