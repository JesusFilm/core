/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyVisitorGoogleSheetDestinationInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyVisitorExportToGoogleSheet
// ====================================================

export interface JourneyVisitorExportToGoogleSheet_journeyVisitorExportToGoogleSheet {
  __typename: "JourneyVisitorGoogleSheetExportResult";
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
}

export interface JourneyVisitorExportToGoogleSheet {
  journeyVisitorExportToGoogleSheet: JourneyVisitorExportToGoogleSheet_journeyVisitorExportToGoogleSheet;
}

export interface JourneyVisitorExportToGoogleSheetVariables {
  journeyId: string;
  destination: JourneyVisitorGoogleSheetDestinationInput;
  integrationId: string;
  timezone?: string | null;
}
