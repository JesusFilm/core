/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyWithUserJourneys
// ====================================================

export interface GetJourneyWithUserJourneys_journey_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export interface GetJourneyWithUserJourneys_journey_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  user: GetJourneyWithUserJourneys_journey_userJourneys_user | null;
}

export interface GetJourneyWithUserJourneys_journey {
  __typename: "Journey";
  id: string;
  userJourneys: GetJourneyWithUserJourneys_journey_userJourneys[] | null;
}

export interface GetJourneyWithUserJourneys {
  journey: GetJourneyWithUserJourneys_journey;
}

export interface GetJourneyWithUserJourneysVariables {
  id: string;
}
