/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GoogleSheetsSyncs
// ====================================================

export interface GoogleSheetsSyncs_googleSheetsSyncs {
  __typename: "GoogleSheetsSync";
  id: string | null;
  spreadsheetId: string | null;
  sheetName: string | null;
  folderId: string | null;
  appendMode: boolean | null;
  journeyId: string | null;
  teamId: string | null;
}

export interface GoogleSheetsSyncs {
  googleSheetsSyncs: GoogleSheetsSyncs_googleSheetsSyncs[];
}

export interface GoogleSheetsSyncsVariables {
  journeyId: string;
}
