/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRequestInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyRequest
// ====================================================

export interface UserJourneyRequest_userJourneyRequest {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
}

export interface UserJourneyRequest {
  userJourneyRequest: UserJourneyRequest_userJourneyRequest;
}

export interface UserJourneyRequestVariables {
  input: UserJourneyRequestInput;
}
