/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GoogleSheetsSyncsFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GoogleSheetsSyncsByIntegration
// ====================================================

export interface GoogleSheetsSyncsByIntegration_googleSheetsSyncs_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
}

export interface GoogleSheetsSyncsByIntegration_googleSheetsSyncs {
  __typename: "GoogleSheetsSync";
  id: string;
  spreadsheetId: string;
  sheetName: string | null;
  email: string | null;
  deletedAt: any | null;
  createdAt: any;
  journey: GoogleSheetsSyncsByIntegration_googleSheetsSyncs_journey;
}

export interface GoogleSheetsSyncsByIntegration {
  googleSheetsSyncs: GoogleSheetsSyncsByIntegration_googleSheetsSyncs[];
}

export interface GoogleSheetsSyncsByIntegrationVariables {
  filter: GoogleSheetsSyncsFilter;
}
