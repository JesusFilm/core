/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRemoveInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyRemove
// ====================================================

export interface UserJourneyRemove_userJourneyRemove_journey_usersJourneys {
  __typename: "UserJourney";
  id: string;
}

export interface UserJourneyRemove_userJourneyRemove_journey {
  __typename: "Journey";
  id: string;
  usersJourneys: UserJourneyRemove_userJourneyRemove_journey_usersJourneys[] | null;
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
  input: UserJourneyRemoveInput;
}
