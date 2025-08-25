/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveUserJourney
// ====================================================

export interface RemoveUserJourney_userJourneyRemoveAll {
  __typename: "UserJourney";
  id: string | null;
}

export interface RemoveUserJourney {
  userJourneyRemoveAll: RemoveUserJourney_userJourneyRemoveAll[] | null;
}

export interface RemoveUserJourneyVariables {
  id: string;
}
