/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyUpdate
// ====================================================

export interface UserJourneyUpdate_userJourneyUpdate {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
}

export interface UserJourneyUpdate {
  userJourneyUpdate: UserJourneyUpdate_userJourneyUpdate;
}

export interface UserJourneyUpdateVariables {
  input: UserJourneyUpdateInput;
}
