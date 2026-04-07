/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: GoogleSheetsSyncDialogBackfill
// ====================================================

export interface GoogleSheetsSyncDialogBackfill_googleSheetsSyncBackfill {
  __typename: "GoogleSheetsSync";
  id: string;
}

export interface GoogleSheetsSyncDialogBackfill {
  /**
   * Triggers a backfill of the Google Sheets sync. Clears existing data and re-exports all events.
   */
  googleSheetsSyncBackfill: GoogleSheetsSyncDialogBackfill_googleSheetsSyncBackfill;
}

export interface GoogleSheetsSyncDialogBackfillVariables {
  id: string;
}
