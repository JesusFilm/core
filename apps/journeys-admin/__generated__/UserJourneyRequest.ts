/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserJourneyRequest
// ====================================================

export interface UserJourneyRequest_userJourneyRequest {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
  role: UserJourneyRole;
}

export interface UserJourneyRequest {
  userJourneyRequest: UserJourneyRequest_userJourneyRequest;
}

export interface UserJourneyRequestVariables {
  journeyId: string;
}
