/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamRole, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyWithUserJourneysAndUserTeams
// ====================================================

export interface GetJourneyWithUserJourneysAndUserTeams_journey_team_userTeams_user {
  __typename: "User";
  email: string;
  firstName: string;
  id: string;
  imageUrl: string | null;
  lastName: string | null;
}

export interface GetJourneyWithUserJourneysAndUserTeams_journey_team_userTeams {
  __typename: "UserTeam";
  id: string;
  role: UserTeamRole;
  user: GetJourneyWithUserJourneysAndUserTeams_journey_team_userTeams_user;
}

export interface GetJourneyWithUserJourneysAndUserTeams_journey_team {
  __typename: "Team";
  id: string;
  userTeams: GetJourneyWithUserJourneysAndUserTeams_journey_team_userTeams[];
}

export interface GetJourneyWithUserJourneysAndUserTeams_journey_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export interface GetJourneyWithUserJourneysAndUserTeams_journey_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  user: GetJourneyWithUserJourneysAndUserTeams_journey_userJourneys_user | null;
}

export interface GetJourneyWithUserJourneysAndUserTeams_journey {
  __typename: "Journey";
  id: string;
  team: GetJourneyWithUserJourneysAndUserTeams_journey_team | null;
  userJourneys: GetJourneyWithUserJourneysAndUserTeams_journey_userJourneys[] | null;
}

export interface GetJourneyWithUserJourneysAndUserTeams {
  journey: GetJourneyWithUserJourneysAndUserTeams_journey;
}

export interface GetJourneyWithUserJourneysAndUserTeamsVariables {
  id: string;
}
