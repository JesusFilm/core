/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyPromote
// ====================================================

export interface UserJourneyPromote_userJourneyPromote_journey_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
}

export interface UserJourneyPromote_userJourneyPromote_journey {
  __typename: "Journey";
  id: string;
  userJourneys: UserJourneyPromote_userJourneyPromote_journey_userJourneys[] | null;
}

export interface UserJourneyPromote_userJourneyPromote {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  journey: UserJourneyPromote_userJourneyPromote_journey | null;
}

export interface UserJourneyPromote {
  userJourneyPromote: UserJourneyPromote_userJourneyPromote;
}

export interface UserJourneyPromoteVariables {
  id: string;
}
