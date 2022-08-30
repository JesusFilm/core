resource "aws_iam_policy" "tfer--AllowExternalDNSUpdates" {
  name = "AllowExternalDNSUpdates"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "route53:ChangeResourceRecordSets"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:route53:::hostedzone/Z1011873IM0JPM6FQOD6"
      ]
    },
    {
      "Action": [
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets"
      ],
      "Effect": "Allow",
      "Resource": [
        "*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  tags = {
    group = "JesusFilm-core"
  }

  tags_all = {
    group = "JesusFilm-core"
  }
}

resource "aws_iam_policy" "tfer--AmazonEKS_EBS_CSI_Driver_Policy" {
  name = "AmazonEKS_EBS_CSI_Driver_Policy"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "ec2:AttachVolume",
        "ec2:CreateSnapshot",
        "ec2:CreateTags",
        "ec2:CreateVolume",
        "ec2:DeleteSnapshot",
        "ec2:DeleteTags",
        "ec2:DeleteVolume",
        "ec2:DescribeAvailabilityZones",
        "ec2:DescribeInstances",
        "ec2:DescribeSnapshots",
        "ec2:DescribeTags",
        "ec2:DescribeVolumes",
        "ec2:DescribeVolumesModifications",
        "ec2:DetachVolume",
        "ec2:ModifyVolume"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY
}
