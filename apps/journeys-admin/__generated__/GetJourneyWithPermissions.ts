/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamRole, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyWithPermissions
// ====================================================

export interface GetJourneyWithPermissions_journey_team_userTeams_user {
  __typename: "User";
  email: string;
  firstName: string;
  id: string;
  imageUrl: string | null;
  lastName: string | null;
}

export interface GetJourneyWithPermissions_journey_team_userTeams_journeyNotification {
  __typename: "JourneyNotification";
  id: string | null;
  visitorInteractionEmail: boolean | null;
}

export interface GetJourneyWithPermissions_journey_team_userTeams {
  __typename: "UserTeam";
  id: string | null;
  role: UserTeamRole | null;
  user: GetJourneyWithPermissions_journey_team_userTeams_user | null;
  journeyNotification: GetJourneyWithPermissions_journey_team_userTeams_journeyNotification | null;
}

export interface GetJourneyWithPermissions_journey_team {
  __typename: "Team";
  id: string | null;
  userTeams: GetJourneyWithPermissions_journey_team_userTeams[] | null;
}

export interface GetJourneyWithPermissions_journey_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export interface GetJourneyWithPermissions_journey_userJourneys_journeyNotification {
  __typename: "JourneyNotification";
  id: string | null;
  visitorInteractionEmail: boolean | null;
}

export interface GetJourneyWithPermissions_journey_userJourneys {
  __typename: "UserJourney";
  id: string | null;
  role: UserJourneyRole | null;
  user: GetJourneyWithPermissions_journey_userJourneys_user | null;
  journeyNotification: GetJourneyWithPermissions_journey_userJourneys_journeyNotification | null;
}

export interface GetJourneyWithPermissions_journey {
  __typename: "Journey";
  id: string;
  team: GetJourneyWithPermissions_journey_team | null;
  userJourneys: GetJourneyWithPermissions_journey_userJourneys[] | null;
}

export interface GetJourneyWithPermissions {
  journey: GetJourneyWithPermissions_journey;
}

export interface GetJourneyWithPermissionsVariables {
  id: string;
}
