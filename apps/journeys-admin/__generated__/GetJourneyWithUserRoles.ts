/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyWithUserRoles
// ====================================================

export interface GetJourneyWithUserRoles_journey_userJourneys_user {
  __typename: "User";
  id: string;
}

export interface GetJourneyWithUserRoles_journey_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  user: GetJourneyWithUserRoles_journey_userJourneys_user | null;
}

export interface GetJourneyWithUserRoles_journey {
  __typename: "Journey";
  id: string;
  userJourneys: GetJourneyWithUserRoles_journey_userJourneys[] | null;
}

export interface GetJourneyWithUserRoles {
  journey: GetJourneyWithUserRoles_journey;
}

export interface GetJourneyWithUserRolesVariables {
  id: string;
}
