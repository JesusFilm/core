/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GoogleSheetsSyncs
// ====================================================

export interface GoogleSheetsSyncs_googleSheetsSyncs_integration_IntegrationGoogle {
  __typename: "IntegrationGoogle";
  id: string;
  accountEmail: string | null;
}

export interface GoogleSheetsSyncs_googleSheetsSyncs_integration_IntegrationGrowthSpaces {
  __typename: "IntegrationGrowthSpaces";
  id: string;
}

export type GoogleSheetsSyncs_googleSheetsSyncs_integration =
  | GoogleSheetsSyncs_googleSheetsSyncs_integration_IntegrationGoogle
  | GoogleSheetsSyncs_googleSheetsSyncs_integration_IntegrationGrowthSpaces;

export interface GoogleSheetsSyncs_googleSheetsSyncs {
  __typename: "GoogleSheetsSync";
  id: string | null;
  spreadsheetId: string | null;
  sheetName: string | null;
  folderId: string | null;
  appendMode: boolean | null;
  journeyId: string | null;
  teamId: string | null;
  createdAt: any;
  integration: GoogleSheetsSyncs_googleSheetsSyncs_integration;
}

export interface GoogleSheetsSyncs {
  googleSheetsSyncs: GoogleSheetsSyncs_googleSheetsSyncs[];
}

export interface GoogleSheetsSyncsVariables {
  journeyId: string;
}
