/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GoogleSheetsSyncsFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GoogleSheetsSyncsForDoneScreen
// ====================================================

export interface GoogleSheetsSyncsForDoneScreen_googleSheetsSyncs {
  __typename: "GoogleSheetsSync";
  id: string;
  deletedAt: any | null;
}

export interface GoogleSheetsSyncsForDoneScreen {
  googleSheetsSyncs: GoogleSheetsSyncsForDoneScreen_googleSheetsSyncs[];
}

export interface GoogleSheetsSyncsForDoneScreenVariables {
  filter: GoogleSheetsSyncsFilter;
}
