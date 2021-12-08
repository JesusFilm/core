/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRemoveInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyRemove
// ====================================================

export interface UserJourneyRemove_userJourneyRemove {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
}

export interface UserJourneyRemove {
  userJourneyRemove: UserJourneyRemove_userJourneyRemove;
}

export interface UserJourneyRemoveVariables {
  input: UserJourneyRemoveInput;
}
