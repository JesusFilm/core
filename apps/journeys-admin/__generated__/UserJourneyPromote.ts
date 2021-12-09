/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyPromote
// ====================================================

export interface UserJourneyPromote_userJourneyPromote {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
}

export interface UserJourneyPromote {
  userJourneyPromote: UserJourneyPromote_userJourneyPromote;
}

export interface UserJourneyPromoteVariables {
  input: UserJourneyUpdateInput;
}
