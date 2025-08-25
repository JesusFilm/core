/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserJourneyRequest
// ====================================================

export interface UserJourneyRequest_userJourneyRequest {
  __typename: "UserJourney";
  id: string | null;
}

export interface UserJourneyRequest {
  userJourneyRequest: UserJourneyRequest_userJourneyRequest | null;
}

export interface UserJourneyRequestVariables {
  journeyId: string;
}
