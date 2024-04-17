/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyProfileAndTeams
// ====================================================

export interface GetJourneyProfileAndTeams_getJourneyProfile {
  __typename: "JourneyProfile";
  id: string;
  userId: string;
  acceptedTermsAt: DateTime | null;
  onboardingFormCompletedAt: DateTime | null;
}

export interface GetJourneyProfileAndTeams_teams {
  __typename: "Team";
  id: string;
}

export interface GetJourneyProfileAndTeams {
  getJourneyProfile: GetJourneyProfileAndTeams_getJourneyProfile | null;
  teams: GetJourneyProfileAndTeams_teams[];
}
