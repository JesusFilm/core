/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAdminJourneyWithPlausibleToken
// ====================================================

export interface GetAdminJourneyWithPlausibleToken_journey {
  __typename: "Journey";
  /**
   * used in a plausible share link to embed report
   */
  plausibleToken: string | null;
}

export interface GetAdminJourneyWithPlausibleToken {
  journey: GetAdminJourneyWithPlausibleToken_journey;
}

export interface GetAdminJourneyWithPlausibleTokenVariables {
  id: string;
}
