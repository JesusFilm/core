/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GoogleSheetsSyncDialogJourney
// ====================================================

export interface GoogleSheetsSyncDialogJourney_journey_team {
  __typename: "Team";
  id: string;
}

export interface GoogleSheetsSyncDialogJourney_journey {
  __typename: "Journey";
  id: string;
  createdAt: any;
  /**
   * private title for creators
   */
  title: string;
  team: GoogleSheetsSyncDialogJourney_journey_team | null;
}

export interface GoogleSheetsSyncDialogJourney {
  journey: GoogleSheetsSyncDialogJourney_journey;
}

export interface GoogleSheetsSyncDialogJourneyVariables {
  id: string;
}
