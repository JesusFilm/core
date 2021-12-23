/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyRemove
// ====================================================

export interface UserJourneyRemove_userJourneyRemove_journey_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
}

export interface UserJourneyRemove_userJourneyRemove_journey {
  __typename: "Journey";
  id: string;
  userJourneys: UserJourneyRemove_userJourneyRemove_journey_userJourneys[] | null;
}

export interface UserJourneyRemove_userJourneyRemove {
  __typename: "UserJourney";
  id: string;
  journey: UserJourneyRemove_userJourneyRemove_journey | null;
}

export interface UserJourneyRemove {
  userJourneyRemove: UserJourneyRemove_userJourneyRemove;
}

export interface UserJourneyRemoveVariables {
  userJourneyRemoveId: string;
}
