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
  id: string | null;
  role: UserJourneyRole | null;
}

export interface UserJourneyPromote_userJourneyPromote_journey {
  __typename: "Journey";
  id: string;
  userJourneys: UserJourneyPromote_userJourneyPromote_journey_userJourneys[] | null;
}

export interface UserJourneyPromote_userJourneyPromote {
  __typename: "UserJourney";
  id: string | null;
  role: UserJourneyRole | null;
  journey: UserJourneyPromote_userJourneyPromote_journey | null;
}

export interface UserJourneyPromote {
  userJourneyPromote: UserJourneyPromote_userJourneyPromote | null;
}

export interface UserJourneyPromoteVariables {
  id: string;
}
