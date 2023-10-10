/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAdminJourney
// ====================================================

export interface GetAdminJourney_adminJourney {
  __typename: "Journey";
  id: string;
  template: boolean | null;
}

export interface GetAdminJourney {
  adminJourney: GetAdminJourney_adminJourney;
}

export interface GetAdminJourneyVariables {
  adminJourneyId: string;
}
