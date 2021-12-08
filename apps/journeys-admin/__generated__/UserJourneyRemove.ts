/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRemoveInput, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyRemove
// ====================================================

export interface UserJourneyRemove_userJourneyRemove {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
  role: UserJourneyRole;
}

export interface UserJourneyRemove {
  userJourneyRemove: UserJourneyRemove_userJourneyRemove;
}

export interface UserJourneyRemoveVariables {
  input: UserJourneyRemoveInput;
}
