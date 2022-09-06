resource "aws_iam_role_policy" "tfer--AWSReservedSSO_devops-engineering_41bbd67f6714fe63_AwsSSOInlinePolicy" {
  name = "AwsSSOInlinePolicy"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "cur:*",
        "ce:*",
        "budgets:ViewBudget",
        "budgets:Describe*",
        "aws-portal:ViewBilling"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "AllowAdminCostExplorer"
    },
    {
      "Action": [
        "rds:PurchaseReservedDBInstancesOffering",
        "elasticache:PurchaseReservedCacheNodesOffering",
        "ec2:PurchaseReservedInstancesOffering",
        "ec2:ModifyReservedInstances"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "ManageReservedInstances"
    },
    {
      "Action": "savingsplans:*",
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "ManageSavingsPlans"
    },
    {
      "Action": "iam:*",
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "ManageIAM"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "AWSReservedSSO_devops-engineering_41bbd67f6714fe63"
}

resource "aws_iam_role_policy" "tfer--AWSReservedSSO_google-migrations-admin_7282bdac0a32df41_AwsSSOInlinePolicy" {
  name = "AwsSSOInlinePolicy"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "ec2:Describe*",
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "FullDescribeAll"
    },
    {
      "Action": "ec2:*",
      "Condition": {
        "StringLike": {
          "ec2:ResourceTag/type": "google-migrations"
        }
      },
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "FullInstancesAccess"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "AWSReservedSSO_google-migrations-admin_7282bdac0a32df41"
}

resource "aws_iam_role_policy" "tfer--AWSReservedSSO_network-engineering_40e4bc0151e285d5_AwsSSOInlinePolicy" {
  name = "AwsSSOInlinePolicy"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "ec2:Search*",
        "ec2:List*",
        "ec2:Get*",
        "ec2:Describe*"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "FullDescribeAll"
    },
    {
      "Action": "ec2:*",
      "Condition": {
        "StringLike": {
          "ec2:ResourceTag/owner": [
            "nts.support@cru.org"
          ]
        }
      },
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "FullAcessNetworkInstances"
    },
    {
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": ""
    },
    {
      "Action": "s3:*",
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::cru-collab-software/*",
        "arn:aws:s3:::cru-collab-software"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "ecs:ListTasks",
        "ecs:ListTaskDefinitions",
        "ecs:ListTaskDefinitionFamilies",
        "ecs:ListTagsForResource",
        "ecs:ListServices",
        "ecs:ListContainerInstances",
        "ecs:ListClusters",
        "ecs:ListAttributes",
        "ecs:ListAccountSettings",
        "ecs:DescribeTasks",
        "ecs:DescribeTaskSets",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeServices",
        "ecs:DescribeContainerInstances",
        "ecs:DescribeClusters",
        "ecs:DescribeCapacityProviders"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "ECSReadAccess"
    },
    {
      "Action": [
        "ec2:GetVpnConnectionDeviceTypes",
        "ec2:GetVpnConnectionDeviceSampleConfiguration"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "VPNGetConfig"
    },
    {
      "Action": [
        "ec2:GetTransitGateway*",
        "ec2:DescribeTransitGateway*"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "ViewTransitGateway"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "AWSReservedSSO_network-engineering_40e4bc0151e285d5"
}

resource "aws_iam_role_policy" "tfer--AWSReservedSSO_pritunl-admin_b7f20d56937aa70a_AwsSSOInlinePolicy" {
  name = "AwsSSOInlinePolicy"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "ec2:Describe*",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:GetMetricData",
        "cloudwatch:DescribeAlarms"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "FullDescribeAll"
    },
    {
      "Action": "ec2:*",
      "Condition": {
        "StringLike": {
          "ec2:ResourceTag/application": "pritunl"
        }
      },
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "FullAcessNetworkInstances"
    },
    {
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "ListAllBuckets"
    },
    {
      "Action": "s3:*",
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::pritunl-mongo-backup/*",
        "arn:aws:s3:::pritunl-mongo-backup"
      ],
      "Sid": "AllowS3FullAccess"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "AWSReservedSSO_pritunl-admin_b7f20d56937aa70a"
}

resource "aws_iam_role_policy" "tfer--EMR_DefaultRole_EMR_DefaultRole" {
  name = "EMR_DefaultRole"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:CancelSpotInstanceRequests",
        "ec2:CreateSecurityGroup",
        "ec2:CreateTags",
        "ec2:DeleteTags",
        "ec2:Describe*",
        "ec2:ModifyImageAttribute",
        "ec2:ModifyInstanceAttribute",
        "ec2:RequestSpotInstances",
        "ec2:RunInstances",
        "ec2:TerminateInstances",
        "iam:PassRole",
        "iam:ListRolePolicies",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:ListInstanceProfiles",
        "s3:Get*",
        "s3:CreateBucket",
        "s3:List*",
        "sdb:BatchPutAttributes",
        "sdb:Select"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
POLICY

  role = "EMR_DefaultRole"
}

resource "aws_iam_role_policy" "tfer--EMR_EC2_DefaultRole_EMR_EC2_DefaultRole" {
  name = "EMR_EC2_DefaultRole"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "cloudwatch:*",
        "dynamodb:*",
        "ec2:Describe*",
        "elasticmapreduce:Describe*",
        "rds:Describe*",
        "s3:*",
        "sdb:*",
        "sns:*",
        "sqs:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
POLICY

  role = "EMR_EC2_DefaultRole"
}

resource "aws_iam_role_policy" "tfer--Elastic_Transcoder_Default_Role_ets-console-generated-policy" {
  name = "ets-console-generated-policy"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:Put*",
        "s3:ListBucket",
        "s3:*MultipartUpload*",
        "s3:Get*"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "1"
    },
    {
      "Action": "sns:Publish",
      "Effect": "Allow",
      "Resource": "*",
      "Sid": "2"
    },
    {
      "Action": [
        "s3:*Delete*",
        "s3:*Policy*",
        "sns:*Remove*",
        "sns:*Delete*",
        "sns:*Permission*"
      ],
      "Effect": "Deny",
      "Resource": "*",
      "Sid": "3"
    }
  ],
  "Version": "2008-10-17"
}
POLICY

  role = "Elastic_Transcoder_Default_Role"
}

resource "aws_iam_role_policy" "tfer--api-example-2-dev-us-east-1-lambdaRole_api-example-2-dev-lambda" {
  name = "api-example-2-dev-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-example-2-dev*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-example-2-dev*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-example-2-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-example-dev-us-east-1-lambdaRole_api-example-dev-lambda" {
  name = "api-example-dev-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-example-dev*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-example-dev*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-example-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-journeys-dev-us-east-1-lambdaRole_api-journeys-dev-lambda" {
  name = "api-journeys-dev-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-dev*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-dev*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-journeys-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-journeys-prod-prod-us-east-1-lambdaRole_api-journeys-prod-prod-lambda" {
  name = "api-journeys-prod-prod-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-prod-prod*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-prod-prod*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-journeys-prod-prod-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-journeys-prod-us-east-1-lambdaRole_api-journeys-prod-lambda" {
  name = "api-journeys-prod-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-prod*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-prod*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-journeys-prod-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-journeys-stage-us-east-1-lambdaRole_api-journeys-stage-lambda" {
  name = "api-journeys-stage-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-stage*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-journeys-stage*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-journeys-stage-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-media-dev-us-east-1-lambdaRole_access-ark-core-bucket" {
  name = "access-ark-core-bucket"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:Put*",
        "s3:Get*",
        "s3:Delete*"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::ark-core/*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-media-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-media-dev-us-east-1-lambdaRole_api-media-dev-lambda" {
  name = "api-media-dev-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-media-dev*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-media-dev*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-media-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-media-stage-us-east-1-lambdaRole_AccessArkMediaS3" {
  name = "AccessArkMediaS3"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::ark-core/media/*"
      ],
      "Sid": "AccessArkMediaS3"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-media-stage-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-media-stage-us-east-1-lambdaRole_api-media-stage-lambda" {
  name = "api-media-stage-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-media-stage*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-media-stage*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-media-stage-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-test-dev-us-east-1-lambdaRole_api-test-dev-lambda" {
  name = "api-test-dev-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-test-dev*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-test-dev*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-test-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--api-test1-dev-us-east-1-lambdaRole_api-test1-dev-lambda" {
  name = "api-test1-dev-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-test1-dev*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/api-test1-dev*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "api-test1-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--couchbase_firehose_delivery_role_couchbase_firehose_delivery_policy" {
  name = "couchbase_firehose_delivery_policy"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::arclight-es-logs",
        "arn:aws:s3:::arclight-es-logs/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "lambda:InvokeFunction",
        "lambda:GetFunctionConfiguration"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:lambda:us-east-1:894231352815:function:couchbase-ingest-cluster-stats:$LATEST",
        "arn:aws:lambda:us-east-1:894231352815:function:nexus-arclight-org-access:$LATEST",
        "arn:aws:lambda:us-east-1:894231352815:function:nexus-arclight-org:$LATEST",
        "arn:aws:lambda:us-east-1:894231352815:function:pl-arc-gt-access:$LATEST"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "es:DescribeElasticsearchDomain",
        "es:DescribeElasticsearchDomains",
        "es:DescribeElasticsearchDomainConfig",
        "es:ESHttpPost",
        "es:ESHttpPut"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "es:ESHttpGet"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/_all/_settings",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/_cluster/stats",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/_nodes",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/_nodes/stats",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/_nodes/*/stats",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/_stats",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/couchbase*/_mapping/cluster-stats",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/couchbase*/_stats",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/nginx*/_mapping/nginx.access",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/nginx*/_stats",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/nexus*/_mapping/nexus",
        "arn:aws:es:us-east-1:894231352815:domain/arclight-es/nexus*/_stats"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/couchbase-stats:log-stream:*",
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/nexus.arclight.org.access.stream:log-stream:*",
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/nexus.arclight.org.stream:log-stream:*",
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/pl.arc.gt.access.stream:log-stream:*"
      ],
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "couchbase_firehose_delivery_role"
}

resource "aws_iam_role_policy" "tfer--firehose_delivery_role_oneClick_firehose_delivery_role_1461869011040" {
  name = "oneClick_firehose_delivery_role_1461869011040"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::JFP_DW_Dev",
        "arn:aws:s3:::JFP_DW_Dev/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/tracker_poc_custom:log-stream:*"
      ],
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "firehose_delivery_role"
}

resource "aws_iam_role_policy" "tfer--firehose_delivery_role_oneClick_firehose_delivery_role_1467752139775" {
  name = "oneClick_firehose_delivery_role_1467752139775"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::JFP_DW_Prod",
        "arn:aws:s3:::JFP_DW_Prod/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/prod_events:log-stream:*"
      ],
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "firehose_delivery_role"
}

resource "aws_iam_role_policy" "tfer--firehose_delivery_role_oneClick_firehose_delivery_role_1469827607528" {
  name = "oneClick_firehose_delivery_role_1469827607528"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::jfp-me2-events-prod",
        "arn:aws:s3:::jfp-me2-events-prod/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-prod-play:log-stream:*"
      ],
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "firehose_delivery_role"
}

resource "aws_iam_role_policy" "tfer--firehose_delivery_role_oneClick_firehose_delivery_role_1469827923540" {
  name = "oneClick_firehose_delivery_role_1469827923540"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::jfp-me2-events-prod",
        "arn:aws:s3:::jfp-me2-events-prod/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-prod-share:log-stream:*"
      ],
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "firehose_delivery_role"
}

resource "aws_iam_role_policy" "tfer--firehose_delivery_role_oneClick_firehose_delivery_role_1469828041591" {
  name = "oneClick_firehose_delivery_role_1469828041591"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::jfp-me2-events-prod",
        "arn:aws:s3:::jfp-me2-events-prod/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-prod-error:log-stream:*"
      ],
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "firehose_delivery_role"
}

resource "aws_iam_role_policy" "tfer--firehose_delivery_role_oneClick_firehose_delivery_role_1469828125493" {
  name = "oneClick_firehose_delivery_role_1469828125493"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::jfp-me2-events-stage",
        "arn:aws:s3:::jfp-me2-events-stage/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-stage-play:log-stream:*"
      ],
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "firehose_delivery_role"
}

resource "aws_iam_role_policy" "tfer--firehose_delivery_role_oneClick_firehose_delivery_role_1469828219712" {
  name = "oneClick_firehose_delivery_role_1469828219712"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::jfp-me2-events-stage",
        "arn:aws:s3:::jfp-me2-events-stage/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-stage-share:log-stream:*"
      ],
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "firehose_delivery_role"
}

resource "aws_iam_role_policy" "tfer--firehose_delivery_role_oneClick_firehose_delivery_role_1469828316595" {
  name = "oneClick_firehose_delivery_role_1469828316595"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::jfp-me2-events-stage",
        "arn:aws:s3:::jfp-me2-events-stage/*"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/kinesisfirehose/me2-firehose-stage-error:log-stream:*"
      ],
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "firehose_delivery_role"
}

resource "aws_iam_role_policy" "tfer--lambda_basic_execution_oneClick_lambda_basic_execution_1464814276130" {
  name = "oneClick_lambda_basic_execution_1464814276130"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:logs:*:*:*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "lambda_basic_execution"
}

resource "aws_iam_role_policy" "tfer--lambda_basic_execution_oneClick_lambda_basic_execution_1466875087844" {
  name = "oneClick_lambda_basic_execution_1466875087844"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:logs:*:*:*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "lambda_basic_execution"
}

resource "aws_iam_role_policy" "tfer--lambda_basic_execution_oneClick_lambda_basic_execution_1467668823983" {
  name = "oneClick_lambda_basic_execution_1467668823983"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:logs:*:*:*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "lambda_basic_execution"
}

resource "aws_iam_role_policy" "tfer--lambda_basic_execution_oneClick_lambda_basic_execution_1467818312602" {
  name = "oneClick_lambda_basic_execution_1467818312602"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:logs:*:*:*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "lambda_basic_execution"
}

resource "aws_iam_role_policy" "tfer--lambda_basic_vpc_execution_oneClick_lambda_basic_vpc_execution_1465485162643" {
  name = "oneClick_lambda_basic_vpc_execution_1465485162643"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Action": [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DetachNetworkInterface",
        "ec2:DeleteNetworkInterface"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "lambda_basic_vpc_execution"
}

resource "aws_iam_role_policy" "tfer--lambda_plumber_role_oneClick_lambda_basic_execution_1467819001540" {
  name = "oneClick_lambda_basic_execution_1467819001540"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Effect": "Allow",
      "Resource": [
        "*"
      ]
    },
    {
      "Action": [
        "kinesis:GetRecords",
        "kinesis:GetShardIterator",
        "kinesis:DescribeStream",
        "kinesis:ListStreams",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "lambda_plumber_role"
}

resource "aws_iam_role_policy" "tfer--lambda_plumber_role_oneClick_lambda_plumber_role_1467819208256" {
  name = "oneClick_lambda_plumber_role_1467819208256"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Effect": "Allow",
      "Resource": [
        "*"
      ]
    },
    {
      "Action": [
        "kinesis:GetRecords",
        "kinesis:GetShardIterator",
        "kinesis:DescribeStream",
        "kinesis:ListStreams",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "lambda_plumber_role"
}

resource "aws_iam_role_policy" "tfer--sean-dev-us-east-1-lambdaRole_sean-dev-lambda" {
  name = "sean-dev-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/sean-dev*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/sean-dev*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "sean-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--test-bogus-totally-bogus-dev-us-east-1-lambdaRole_test-bogus-totally-bogus-dev-lambda" {
  name = "test-bogus-totally-bogus-dev-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/test-bogus-totally-bogus-dev*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/test-bogus-totally-bogus-dev*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "test-bogus-totally-bogus-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy" "tfer--test-dev-us-east-1-lambdaRole_test-dev-lambda" {
  name = "test-dev-lambda"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/test-dev*:*"
      ]
    },
    {
      "Action": [
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:us-east-1:894231352815:log-group:/aws/lambda/test-dev*:*:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  role = "test-dev-us-east-1-lambdaRole"
}
