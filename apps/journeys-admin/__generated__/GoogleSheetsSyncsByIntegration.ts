/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GoogleSheetsSyncsByIntegration
// ====================================================

export interface GoogleSheetsSyncsByIntegration_googleSheetsSyncsByIntegration_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
}

export interface GoogleSheetsSyncsByIntegration_googleSheetsSyncsByIntegration {
  __typename: "GoogleSheetsSync";
  id: string | null;
  spreadsheetId: string | null;
  sheetName: string | null;
  email: string | null;
  deletedAt: any | null;
  createdAt: any;
  journey: GoogleSheetsSyncsByIntegration_googleSheetsSyncsByIntegration_journey;
}

export interface GoogleSheetsSyncsByIntegration {
  googleSheetsSyncsByIntegration: GoogleSheetsSyncsByIntegration_googleSheetsSyncsByIntegration[];
}

export interface GoogleSheetsSyncsByIntegrationVariables {
  integrationId: string;
}
