/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyEventsFilter, JourneyVisitorExportSelect, JourneyVisitorGoogleSheetDestinationInput } from "./globalTypes";

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
  filter?: JourneyEventsFilter | null;
  select?: JourneyVisitorExportSelect | null;
  destination: JourneyVisitorGoogleSheetDestinationInput;
  integrationId: string;
  timezone?: string | null;
}
