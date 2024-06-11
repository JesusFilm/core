/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ResourceFromTemplate
// ====================================================

export interface ResourceFromTemplate_resourceFromTemplate {
  __typename: "Resource";
  id: string;
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
