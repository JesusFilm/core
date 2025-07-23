/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyProfileAndTeams
// ====================================================

export interface GetJourneyProfileAndTeams_getJourneyProfile {
  __typename: "JourneyProfile";
  id: string | null;
  userId: string | null;
  acceptedTermsAt: any | null;
}

export interface GetJourneyProfileAndTeams_teams {
  __typename: "Team";
  id: string | null;
}

export interface GetJourneyProfileAndTeams {
  getJourneyProfile: GetJourneyProfileAndTeams_getJourneyProfile | null;
  teams: GetJourneyProfileAndTeams_teams[] | null;
}
