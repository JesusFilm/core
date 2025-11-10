/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GoogleSheetsSyncsFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GoogleSheetsSyncs
// ====================================================

export interface GoogleSheetsSyncs_googleSheetsSyncs_integration_IntegrationGrowthSpaces {
  __typename: "IntegrationGrowthSpaces";
  id: string;
}

export interface GoogleSheetsSyncs_googleSheetsSyncs_integration_IntegrationGoogle {
  __typename: "IntegrationGoogle";
  id: string;
  accountEmail: string | null;
}

export type GoogleSheetsSyncs_googleSheetsSyncs_integration = GoogleSheetsSyncs_googleSheetsSyncs_integration_IntegrationGrowthSpaces | GoogleSheetsSyncs_googleSheetsSyncs_integration_IntegrationGoogle;

export interface GoogleSheetsSyncs_googleSheetsSyncs {
  __typename: "GoogleSheetsSync";
  id: string;
  spreadsheetId: string;
  sheetName: string | null;
  email: string | null;
  deletedAt: any | null;
  createdAt: any;
  integration: GoogleSheetsSyncs_googleSheetsSyncs_integration | null;
}

export interface GoogleSheetsSyncs {
  googleSheetsSyncs: GoogleSheetsSyncs_googleSheetsSyncs[];
}

export interface GoogleSheetsSyncsVariables {
  filter: GoogleSheetsSyncsFilter;
}
