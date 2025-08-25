/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyWithUserRoles
// ====================================================

export interface GetJourneyWithUserRoles_adminJourney_userJourneys_user {
  __typename: "User";
  id: string;
  email: string;
}

export interface GetJourneyWithUserRoles_adminJourney_userJourneys {
  __typename: "UserJourney";
  id: string | null;
  role: UserJourneyRole | null;
  user: GetJourneyWithUserRoles_adminJourney_userJourneys_user | null;
}

export interface GetJourneyWithUserRoles_adminJourney {
  __typename: "Journey";
  id: string;
  userJourneys: GetJourneyWithUserRoles_adminJourney_userJourneys[] | null;
}

export interface GetJourneyWithUserRoles {
  adminJourney: GetJourneyWithUserRoles_adminJourney;
}

export interface GetJourneyWithUserRolesVariables {
  id: string;
}
