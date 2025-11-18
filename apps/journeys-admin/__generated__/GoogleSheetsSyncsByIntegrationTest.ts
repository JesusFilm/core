/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GoogleSheetsSyncsFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GoogleSheetsSyncsByIntegrationTest
// ====================================================

export interface GoogleSheetsSyncsByIntegrationTest_googleSheetsSyncs {
  __typename: "GoogleSheetsSync";
  id: string;
}

export interface GoogleSheetsSyncsByIntegrationTest {
  googleSheetsSyncs: GoogleSheetsSyncsByIntegrationTest_googleSheetsSyncs[];
}

export interface GoogleSheetsSyncsByIntegrationTestVariables {
  filter: GoogleSheetsSyncsFilter;
}
