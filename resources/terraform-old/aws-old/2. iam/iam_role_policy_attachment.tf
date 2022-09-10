resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-admin-preprod_AWSCodePipelineServiceRole-us-east-1-admin-preprod" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-admin-preprod"
  role       = "AWSCodePipelineServiceRole-us-east-1-admin-preprod"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-admin-prod_AWSCodePipelineServiceRole-us-east-1-admin-prod" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-admin-prod"
  role       = "AWSCodePipelineServiceRole-us-east-1-admin-prod"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-admin-qa_AWSCodePipelineServiceRole-us-east-1-admin-qa" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-admin-qa"
  role       = "AWSCodePipelineServiceRole-us-east-1-admin-qa"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-api-preprod-admin_AWSCodePipelineServiceRole-us-east-1-api-preprod-admin" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-api-preprod-admin"
  role       = "AWSCodePipelineServiceRole-us-east-1-api-preprod-admin"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-api-preprod_AWSCodePipelineServiceRole-us-east-1-api-preprod" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-api-preprod"
  role       = "AWSCodePipelineServiceRole-us-east-1-api-preprod"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-api-prod-admin_AWSCodePipelineServiceRole-us-east-1-api-prod-admin" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-api-prod-admin"
  role       = "AWSCodePipelineServiceRole-us-east-1-api-prod-admin"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-api-prod_AWSCodePipelineServiceRole-us-east-1-api-prod" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-api-prod"
  role       = "AWSCodePipelineServiceRole-us-east-1-api-prod"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-api-qa_AWSCodePipelineServiceRole-us-east-1-api-qa" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-api-qa"
  role       = "AWSCodePipelineServiceRole-us-east-1-api-qa"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-arclight-api-qa_AWSCodePipelineServiceRole-us-east-1-arclight-api-qa" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-arclight-api-qa"
  role       = "AWSCodePipelineServiceRole-us-east-1-arclight-api-qa"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-import-preprod_AWSCodePipelineServiceRole-us-east-1-import-preprod" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-import-preprod"
  role       = "AWSCodePipelineServiceRole-us-east-1-import-preprod"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-import-prod_AWSCodePipelineServiceRole-us-east-1-import-prod" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-import-prod"
  role       = "AWSCodePipelineServiceRole-us-east-1-import-prod"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSCodePipelineServiceRole-us-east-1-import-qa_AWSCodePipelineServiceRole-us-east-1-import-qa" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSCodePipelineServiceRole-us-east-1-import-qa"
  role       = "AWSCodePipelineServiceRole-us-east-1-import-qa"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSGlueServiceRole-Arclight-RDS-prod_AWSGlueServiceRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
  role       = "AWSGlueServiceRole-Arclight-RDS-prod"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSGlueServiceRole-Arclight-RDS-prod_AmazonRDSDataFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
  role       = "AWSGlueServiceRole-Arclight-RDS-prod"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSGlueServiceRole-JFP-DW-Prod-play_AWSGlueServiceRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
  role       = "AWSGlueServiceRole-JFP-DW-Prod-play"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSGlueServiceRole-JFP-DW-Prod-play_AWSGlueServiceRole-JFP-DW-Prod-play" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSGlueServiceRole-JFP-DW-Prod-play"
  role       = "AWSGlueServiceRole-JFP-DW-Prod-play"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_devops-engineering_41bbd67f6714fe63_SecurityAudit" {
  policy_arn = "arn:aws:iam::aws:policy/SecurityAudit"
  role       = "AWSReservedSSO_devops-engineering_41bbd67f6714fe63"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_devops-engineering_41bbd67f6714fe63_ViewOnlyAccess" {
  policy_arn = "arn:aws:iam::aws:policy/job-function/ViewOnlyAccess"
  role       = "AWSReservedSSO_devops-engineering_41bbd67f6714fe63"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_google-migrations-admin_7282bdac0a32df41_CloudWatchReadOnlyAccess" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess"
  role       = "AWSReservedSSO_google-migrations-admin_7282bdac0a32df41"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_network-engineering_40e4bc0151e285d5_AWSCloudTrail_FullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AWSCloudTrail_FullAccess"
  role       = "AWSReservedSSO_network-engineering_40e4bc0151e285d5"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_network-engineering_40e4bc0151e285d5_AWSDirectConnectFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AWSDirectConnectFullAccess"
  role       = "AWSReservedSSO_network-engineering_40e4bc0151e285d5"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_network-engineering_40e4bc0151e285d5_AWSNetworkManagerReadOnlyAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AWSNetworkManagerReadOnlyAccess"
  role       = "AWSReservedSSO_network-engineering_40e4bc0151e285d5"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_network-engineering_40e4bc0151e285d5_AWSSupportAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AWSSupportAccess"
  role       = "AWSReservedSSO_network-engineering_40e4bc0151e285d5"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_network-engineering_40e4bc0151e285d5_AmazonEC2ReadOnlyAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess"
  role       = "AWSReservedSSO_network-engineering_40e4bc0151e285d5"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_network-engineering_40e4bc0151e285d5_AmazonRoute53ReadOnlyAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"
  role       = "AWSReservedSSO_network-engineering_40e4bc0151e285d5"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_network-engineering_40e4bc0151e285d5_AmazonVPCFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonVPCFullAccess"
  role       = "AWSReservedSSO_network-engineering_40e4bc0151e285d5"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSReservedSSO_network-engineering_40e4bc0151e285d5_CloudWatchReadOnlyAccess" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess"
  role       = "AWSReservedSSO_network-engineering_40e4bc0151e285d5"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAPIGateway_APIGatewayServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/APIGatewayServiceRolePolicy"
  role       = "AWSServiceRoleForAPIGateway"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAmazonEKSNodegroup_AWSServiceRoleForAmazonEKSNodegroup" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSServiceRoleForAmazonEKSNodegroup"
  role       = "AWSServiceRoleForAmazonEKSNodegroup"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAmazonEKS_AmazonEKSServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonEKSServiceRolePolicy"
  role       = "AWSServiceRoleForAmazonEKS"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAmazonElasticFileSystem_AmazonElasticFileSystemServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonElasticFileSystemServiceRolePolicy"
  role       = "AWSServiceRoleForAmazonElasticFileSystem"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAmazonElasticsearchService_AmazonElasticsearchServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonElasticsearchServiceRolePolicy"
  role       = "AWSServiceRoleForAmazonElasticsearchService"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAmazonOpenSearchService_AmazonOpenSearchServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonOpenSearchServiceRolePolicy"
  role       = "AWSServiceRoleForAmazonOpenSearchService"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAmazonSSM_AmazonSSMServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonSSMServiceRolePolicy"
  role       = "AWSServiceRoleForAmazonSSM"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForApplicationAutoScaling_ECSService_AWSApplicationAutoscalingECSServicePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSApplicationAutoscalingECSServicePolicy"
  role       = "AWSServiceRoleForApplicationAutoScaling_ECSService"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForAutoScaling_AutoScalingServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AutoScalingServiceRolePolicy"
  role       = "AWSServiceRoleForAutoScaling"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForBackup_AWSBackupServiceLinkedRolePolicyForBackup" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSBackupServiceLinkedRolePolicyForBackup"
  role       = "AWSServiceRoleForBackup"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForCloudFrontLogger_AWSCloudFrontLogger" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSCloudFrontLogger"
  role       = "AWSServiceRoleForCloudFrontLogger"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForCloudTrail_CloudTrailServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/CloudTrailServiceRolePolicy"
  role       = "AWSServiceRoleForCloudTrail"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForECS_AmazonECSServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonECSServiceRolePolicy"
  role       = "AWSServiceRoleForECS"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForEMRCleanup_AmazonEMRCleanupPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonEMRCleanupPolicy"
  role       = "AWSServiceRoleForEMRCleanup"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForElastiCache_ElastiCacheServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/ElastiCacheServiceRolePolicy"
  role       = "AWSServiceRoleForElastiCache"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForElasticBeanstalk_AWSElasticBeanstalkServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSElasticBeanstalkServiceRolePolicy"
  role       = "AWSServiceRoleForElasticBeanstalk"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForElasticLoadBalancing_AWSElasticLoadBalancingServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSElasticLoadBalancingServiceRolePolicy"
  role       = "AWSServiceRoleForElasticLoadBalancing"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForGlobalAccelerator_AWSGlobalAcceleratorSLRPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSGlobalAcceleratorSLRPolicy"
  role       = "AWSServiceRoleForGlobalAccelerator"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForOrganizations_AWSOrganizationsServiceTrustPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSOrganizationsServiceTrustPolicy"
  role       = "AWSServiceRoleForOrganizations"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForRDS_AmazonRDSServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonRDSServiceRolePolicy"
  role       = "AWSServiceRoleForRDS"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForRedshift_AmazonRedshiftServiceLinkedRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AmazonRedshiftServiceLinkedRolePolicy"
  role       = "AWSServiceRoleForRedshift"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForSSO_AWSSSOServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSSSOServiceRolePolicy"
  role       = "AWSServiceRoleForSSO"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForServiceQuotas_ServiceQuotasServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/ServiceQuotasServiceRolePolicy"
  role       = "AWSServiceRoleForServiceQuotas"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForSupport_AWSSupportServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSSupportServiceRolePolicy"
  role       = "AWSServiceRoleForSupport"
}

resource "aws_iam_role_policy_attachment" "tfer--AWSServiceRoleForTrustedAdvisor_AWSTrustedAdvisorServiceRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/aws-service-role/AWSTrustedAdvisorServiceRolePolicy"
  role       = "AWSServiceRoleForTrustedAdvisor"
}

resource "aws_iam_role_policy_attachment" "tfer--Arclight-Cache-Clearer_ArclightConfigsS3ReadOnly" {
  policy_arn = "arn:aws:iam::894231352815:policy/ArclightConfigsS3ReadOnly"
  role       = "Arclight-Cache-Clearer"
}

resource "aws_iam_role_policy_attachment" "tfer--Arclight-Cache-Clearer_ArclightDescribeResources" {
  policy_arn = "arn:aws:iam::894231352815:policy/ArclightDescribeResources"
  role       = "Arclight-Cache-Clearer"
}

resource "aws_iam_role_policy_attachment" "tfer--Arclight-Cache-Clearer_AutoScalingReadOnlyAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AutoScalingReadOnlyAccess"
  role       = "Arclight-Cache-Clearer"
}

resource "aws_iam_role_policy_attachment" "tfer--Arclight-Config-Fetcher_AmazonKinesisFirehoseFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonKinesisFirehoseFullAccess"
  role       = "Arclight-Config-Fetcher"
}

resource "aws_iam_role_policy_attachment" "tfer--Arclight-Config-Fetcher_AmazonKinesisFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonKinesisFullAccess"
  role       = "Arclight-Config-Fetcher"
}

resource "aws_iam_role_policy_attachment" "tfer--Arclight-Config-Fetcher_ArclightConfigsS3ReadOnly" {
  policy_arn = "arn:aws:iam::894231352815:policy/ArclightConfigsS3ReadOnly"
  role       = "Arclight-Config-Fetcher"
}

resource "aws_iam_role_policy_attachment" "tfer--Arclight-Config-Fetcher_ArclightDescribeResources" {
  policy_arn = "arn:aws:iam::894231352815:policy/ArclightDescribeResources"
  role       = "Arclight-Config-Fetcher"
}

resource "aws_iam_role_policy_attachment" "tfer--ArclightCodeDeploy_AWSCodeDeployRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
  role       = "ArclightCodeDeploy"
}

resource "aws_iam_role_policy_attachment" "tfer--BitbucketCodeDeployer_BitbucketCodeDeployToS3" {
  policy_arn = "arn:aws:iam::894231352815:policy/BitbucketCodeDeployToS3"
  role       = "BitbucketCodeDeployer"
}

resource "aws_iam_role_policy_attachment" "tfer--DataPipelineDefaultResourceRole_AmazonEC2RoleforDataPipelineRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforDataPipelineRole"
  role       = "DataPipelineDefaultResourceRole"
}

resource "aws_iam_role_policy_attachment" "tfer--DataPipelineDefaultRole_AWSDataPipelineRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSDataPipelineRole"
  role       = "DataPipelineDefaultRole"
}

resource "aws_iam_role_policy_attachment" "tfer--EksAWSControl_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = "EksAWSControl"
}

resource "aws_iam_role_policy_attachment" "tfer--IngestMe2Events_AmazonS3FullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
  role       = "IngestMe2Events"
}

resource "aws_iam_role_policy_attachment" "tfer--IngestMe2Events_CloudWatchFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchFullAccess"
  role       = "IngestMe2Events"
}

resource "aws_iam_role_policy_attachment" "tfer--JesusFilmCoreEKSWorkerNodeRole_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_role_policy_attachment" "tfer--JesusFilmCoreEKSWorkerNodeRole_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_role_policy_attachment" "tfer--JesusFilmCoreEKSWorkerNodeRole_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_role_policy_attachment" "tfer--JesusFilmCoreEKSWorkerNodeRole_AmazonSSMManagedInstanceCore" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = "JesusFilmCoreEKSWorkerNodeRole"
}

resource "aws_iam_role_policy_attachment" "tfer--JfmDnsProvider-role_AllowExternalDNSUpdates" {
  policy_arn = "arn:aws:iam::894231352815:policy/AllowExternalDNSUpdates"
  role       = "JfmDnsProvider-role"
}

resource "aws_iam_role_policy_attachment" "tfer--JfmDnsProvider-role_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = "JfmDnsProvider-role"
}

resource "aws_iam_role_policy_attachment" "tfer--JfmExternalDNS_AllowExternalDNSUpdates" {
  policy_arn = "arn:aws:iam::894231352815:policy/AllowExternalDNSUpdates"
  role       = "JfmExternalDNS"
}

resource "aws_iam_role_policy_attachment" "tfer--JfmExternalDNS_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = "JfmExternalDNS"
}

resource "aws_iam_role_policy_attachment" "tfer--NexusMediaComponentIngest-role-apxuuycg_AWSLambdaBasicExecutionRole-cf8927a7-eaaa-47b5-bdc0-7708c33c4877" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-cf8927a7-eaaa-47b5-bdc0-7708c33c4877"
  role       = "NexusMediaComponentIngest-role-apxuuycg"
}

resource "aws_iam_role_policy_attachment" "tfer--OrganizationAccountAccessRole_AdministratorAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
  role       = "OrganizationAccountAccessRole"
}

resource "aws_iam_role_policy_attachment" "tfer--api-gateway-log-writer_AmazonAPIGatewayPushToCloudWatchLogs" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
  role       = "api-gateway-log-writer"
}

resource "aws_iam_role_policy_attachment" "tfer--api-journeys-dev-us-east-1-lambdaRole_AWSLambdaVPCAccessExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = "api-journeys-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy_attachment" "tfer--api-journeys-prod-prod-us-east-1-lambdaRole_AWSLambdaVPCAccessExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = "api-journeys-prod-prod-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy_attachment" "tfer--api-journeys-prod-us-east-1-lambdaRole_AWSLambdaVPCAccessExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = "api-journeys-prod-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy_attachment" "tfer--api-journeys-stage-us-east-1-lambdaRole_AWSLambdaVPCAccessExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = "api-journeys-stage-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy_attachment" "tfer--api-media-dev-us-east-1-lambdaRole_AWSLambdaVPCAccessExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = "api-media-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy_attachment" "tfer--api-media-dev-us-east-1-lambdaRole_AccessArkCoreBucketObjects" {
  policy_arn = "arn:aws:iam::894231352815:policy/AccessArkCoreBucketObjects"
  role       = "api-media-dev-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy_attachment" "tfer--api-media-stage-us-east-1-lambdaRole_AWSLambdaVPCAccessExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = "api-media-stage-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy_attachment" "tfer--api-media-stage-us-east-1-lambdaRole_AccessArkCoreBucketObjects" {
  policy_arn = "arn:aws:iam::894231352815:policy/AccessArkCoreBucketObjects"
  role       = "api-media-stage-us-east-1-lambdaRole"
}

resource "aws_iam_role_policy_attachment" "tfer--appsync-ds-lam-3elgqd-wp-graphql-request_appsync-ds-lam-3elgqd-wp-graphql-request" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/appsync-ds-lam-3elgqd-wp-graphql-request"
  role       = "appsync-ds-lam-3elgqd-wp-graphql-request"
}

resource "aws_iam_role_policy_attachment" "tfer--appsync-graphqlapi-logs-us-west-2_appsync-graphqlapi-logs-us-west-2" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/appsync-graphqlapi-logs-us-west-2"
  role       = "appsync-graphqlapi-logs-us-west-2"
}

resource "aws_iam_role_policy_attachment" "tfer--arclight-apikey-authorize-role-yohbtjp8_AWSLambdaBasicExecutionRole-036eff25-465f-4bef-8136-da7954a08906" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-036eff25-465f-4bef-8136-da7954a08906"
  role       = "arclight-apikey-authorize-role-yohbtjp8"
}

resource "aws_iam_role_policy_attachment" "tfer--arclight-outage-slack-role_AWSLambdaBasicExecutionRole-e5a128db-70f8-43ed-9fc9-d87628a50fef" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-e5a128db-70f8-43ed-9fc9-d87628a50fef"
  role       = "arclight-outage-slack-role"
}

resource "aws_iam_role_policy_attachment" "tfer--arclight-outage-slack-role_AWSLambdaKMSExecutionRole-0af2c3fd-6a0a-46c0-9568-b1f194068eb9" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSLambdaKMSExecutionRole-0af2c3fd-6a0a-46c0-9568-b1f194068eb9"
  role       = "arclight-outage-slack-role"
}

resource "aws_iam_role_policy_attachment" "tfer--aurora-s3-full-access_AmazonS3FullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
  role       = "aurora-s3-full-access"
}

resource "aws_iam_role_policy_attachment" "tfer--aws-elasticbeanstalk-ec2-role_AWSElasticBeanstalkMulticontainerDocker" {
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
  role       = "aws-elasticbeanstalk-ec2-role"
}

resource "aws_iam_role_policy_attachment" "tfer--aws-elasticbeanstalk-ec2-role_AWSElasticBeanstalkWebTier" {
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
  role       = "aws-elasticbeanstalk-ec2-role"
}

resource "aws_iam_role_policy_attachment" "tfer--aws-elasticbeanstalk-ec2-role_AWSElasticBeanstalkWorkerTier" {
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
  role       = "aws-elasticbeanstalk-ec2-role"
}

resource "aws_iam_role_policy_attachment" "tfer--aws-elasticbeanstalk-ec2-role_AmazonS3FullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
  role       = "aws-elasticbeanstalk-ec2-role"
}

resource "aws_iam_role_policy_attachment" "tfer--aws-elasticbeanstalk-service-role_AWSElasticBeanstalkEnhancedHealth" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
  role       = "aws-elasticbeanstalk-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--aws-elasticbeanstalk-service-role_AWSElasticBeanstalkService" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
  role       = "aws-elasticbeanstalk-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--aws-quicksight-service-role-v0_AWSQuickSightIAMPolicy" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSQuickSightIAMPolicy"
  role       = "aws-quicksight-service-role-v0"
}

resource "aws_iam_role_policy_attachment" "tfer--aws-quicksight-service-role-v0_AWSQuickSightRDSPolicy" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSQuickSightRDSPolicy"
  role       = "aws-quicksight-service-role-v0"
}

resource "aws_iam_role_policy_attachment" "tfer--aws-quicksight-service-role-v0_AWSQuickSightRedshiftPolicy" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSQuickSightRedshiftPolicy"
  role       = "aws-quicksight-service-role-v0"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-Arclight-QA-service-role_CodeBuildBasePolicy-Arclight-QA-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-Arclight-QA-us-east-1"
  role       = "codebuild-Arclight-QA-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-admin-preprod-service-role_CodeBuildBasePolicy-admin-preprod-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-admin-preprod-us-east-1"
  role       = "codebuild-admin-preprod-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-admin-prod-service-role_CodeBuildBasePolicy-admin-prod-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-admin-prod-us-east-1"
  role       = "codebuild-admin-prod-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-admin-qa-service-role_CodeBuildBasePolicy-admin-qa-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-admin-qa-us-east-1"
  role       = "codebuild-admin-qa-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-api-preprod-admin-service-role_CodeBuildBasePolicy-api-preprod-admin-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-preprod-admin-us-east-1"
  role       = "codebuild-api-preprod-admin-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-api-preprod-service-role_CodeBuildBasePolicy-api-preprod-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-preprod-us-east-1"
  role       = "codebuild-api-preprod-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-api-prod-admin-service-role_CodeBuildBasePolicy-api-prod-admin-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-prod-admin-us-east-1"
  role       = "codebuild-api-prod-admin-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-api-prod-service-role_CodeBuildBasePolicy-api-prod-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-prod-us-east-1"
  role       = "codebuild-api-prod-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-api-qa-servicerole_CodeBuildBasePolicy-api-qa-import-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-qa-import-us-east-1"
  role       = "codebuild-api-qa-servicerole"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-api-qa-servicerole_CodeBuildBasePolicy-api-qa-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-api-qa-us-east-1"
  role       = "codebuild-api-qa-servicerole"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-import-preprod-service-role_CodeBuildBasePolicy-import-preprod-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-import-preprod-us-east-1"
  role       = "codebuild-import-preprod-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-import-prod-service-role_CodeBuildBasePolicy-import-prod-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-import-prod-us-east-1"
  role       = "codebuild-import-prod-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--codebuild-import-qa-service-role_CodeBuildBasePolicy-import-qa-us-east-1" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/CodeBuildBasePolicy-import-qa-us-east-1"
  role       = "codebuild-import-qa-service-role"
}

resource "aws_iam_role_policy_attachment" "tfer--core-apollo-gateway_core-apollo-gateway" {
  policy_arn = "arn:aws:iam::894231352815:policy/core-apollo-gateway"
  role       = "core-apollo-gateway"
}

resource "aws_iam_role_policy_attachment" "tfer--cwe-role-us-east-1-arclight-api-qa_start-pipeline-execution-us-east-1-arclight-api-qa" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/start-pipeline-execution-us-east-1-arclight-api-qa"
  role       = "cwe-role-us-east-1-arclight-api-qa"
}

resource "aws_iam_role_policy_attachment" "tfer--datainsightsProcessFirstPartyYoutubeChannels-role-xhga0n88_AWSLambdaBasicExecutionRole-6d83a4c4-b877-4b62-9cb5-a630e787e5bb" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-6d83a4c4-b877-4b62-9cb5-a630e787e5bb"
  role       = "datainsightsProcessFirstPartyYoutubeChannels-role-xhga0n88"
}

resource "aws_iam_role_policy_attachment" "tfer--ecsAutoscaleRole_AmazonEC2ContainerServiceAutoscaleRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceAutoscaleRole"
  role       = "ecsAutoscaleRole"
}

resource "aws_iam_role_policy_attachment" "tfer--ecsEventsRole_AmazonEC2ContainerServiceEventsRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole"
  role       = "ecsEventsRole"
}

resource "aws_iam_role_policy_attachment" "tfer--ecsInstanceRole_AmazonEC2ContainerServiceforEC2Role" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
  role       = "ecsInstanceRole"
}

resource "aws_iam_role_policy_attachment" "tfer--ecsServiceRole_AmazonEC2ContainerServiceRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole"
  role       = "ecsServiceRole"
}

resource "aws_iam_role_policy_attachment" "tfer--ecsTaskExecutionRole_AmazonECSTaskExecutionRolePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  role       = "ecsTaskExecutionRole"
}

resource "aws_iam_role_policy_attachment" "tfer--eksctl-JesusFilm-core-addon-iamserviceaccoun-Role1-1MM58AN9NT754_AllowExternalDNSUpdates" {
  policy_arn = "arn:aws:iam::894231352815:policy/AllowExternalDNSUpdates"
  role       = "eksctl-JesusFilm-core-addon-iamserviceaccoun-Role1-1MM58AN9NT754"
}

resource "aws_iam_role_policy_attachment" "tfer--es-media-components-role-wimvjjup_AWSLambdaBasicExecutionRole-d4fbe891-3a27-4670-a527-be33723b4dcc" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-d4fbe891-3a27-4670-a527-be33723b4dcc"
  role       = "es-media-components-role-wimvjjup"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda-bizrules-testing_AWSLambdaVPCAccessExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = "lambda-bizrules-testing"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda-bizrules-testing_AmazonSNSFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
  role       = "lambda-bizrules-testing"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda-bizrules-testing_AmazonSNSRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonSNSRole"
  role       = "lambda-bizrules-testing"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda-bizrules-testing_lambda_to_sns_me2transcheck" {
  policy_arn = "arn:aws:iam::894231352815:policy/lambda_to_sns_me2transcheck"
  role       = "lambda-bizrules-testing"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda-kinesis-execution-role_AWSLambdaKinesisExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaKinesisExecutionRole"
  role       = "lambda-kinesis-execution-role"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_basic_execution_AWSLambdaFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
  role       = "lambda_basic_execution"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_basic_execution_AWSLambdaVPCAccessExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = "lambda_basic_execution"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_basic_vpc_execution_AmazonSNSFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
  role       = "lambda_basic_vpc_execution"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_basic_vpc_execution_lambda_to_sns_me2transcheck" {
  policy_arn = "arn:aws:iam::894231352815:policy/lambda_to_sns_me2transcheck"
  role       = "lambda_basic_vpc_execution"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_plumber_role_AmazonDynamoDBFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  role       = "lambda_plumber_role"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_plumber_role_AmazonKinesisFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonKinesisFullAccess"
  role       = "lambda_plumber_role"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_refresh_api_keys_role_AWSLambdaFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
  role       = "lambda_refresh_api_keys_role"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_refresh_api_keys_role_AmazonSNSFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
  role       = "lambda_refresh_api_keys_role"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_tim_005_AWSLambdaExecute" {
  policy_arn = "arn:aws:iam::aws:policy/AWSLambdaExecute"
  role       = "lambda_tim_005"
}

resource "aws_iam_role_policy_attachment" "tfer--lambda_tim_005_AWSLambdaRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"
  role       = "lambda_tim_005"
}

resource "aws_iam_role_policy_attachment" "tfer--me2-ingest-role_AWSLambdaBasicExecutionRole-55127d15-5bf9-429a-9ea4-b8809b0766a2" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-55127d15-5bf9-429a-9ea4-b8809b0766a2"
  role       = "me2-ingest-role"
}

resource "aws_iam_role_policy_attachment" "tfer--me2-ingest-role_AmazonKinesisFirehoseFullAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonKinesisFirehoseFullAccess"
  role       = "me2-ingest-role"
}

resource "aws_iam_role_policy_attachment" "tfer--rds-monitoring-role_AmazonRDSEnhancedMonitoringRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
  role       = "rds-monitoring-role"
}

resource "aws_iam_role_policy_attachment" "tfer--testFunFun-role-yvq06kzv_AWSLambdaBasicExecutionRole-0222a08b-9a31-4607-a110-9f61b66211da" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-0222a08b-9a31-4607-a110-9f61b66211da"
  role       = "testFunFun-role-yvq06kzv"
}

resource "aws_iam_role_policy_attachment" "tfer--wp-graphql-request-role-07aktf4v_AWSLambdaBasicExecutionRole-6e60b8f9-2dd0-4e7d-bed3-cf50af182f8b" {
  policy_arn = "arn:aws:iam::894231352815:policy/service-role/AWSLambdaBasicExecutionRole-6e60b8f9-2dd0-4e7d-bed3-cf50af182f8b"
  role       = "wp-graphql-request-role-07aktf4v"
}
