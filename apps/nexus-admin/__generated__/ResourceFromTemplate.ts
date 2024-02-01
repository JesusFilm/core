/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceStatus, PrivacyStatus, SourceType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ResourceFromTemplate
// ====================================================

export interface ResourceFromTemplate_resourceFromTemplate_localizations {
  __typename: "ResourceLocalization";
  id: string;
  title: string;
}

export interface ResourceFromTemplate_resourceFromTemplate {
  __typename: "Resource";
  id: string;
  nexusId: string;
  name: string;
  status: ResourceStatus;
  createdAt: any;
  updatedAt: any | null;
  deletedAt: any | null;
  googleDriveLink: string | null;
  category: string;
  privacy: PrivacyStatus;
  sourceType: SourceType;
  localizations: (ResourceFromTemplate_resourceFromTemplate_localizations | null)[];
}

export interface ResourceFromTemplate {
  resourceFromTemplate: ResourceFromTemplate_resourceFromTemplate[] | null;
}

export interface ResourceFromTemplateVariables {
  nexusId: string;
  tokenId: string;
  spreadsheetId: string;
  drivefolderId: string;
}
