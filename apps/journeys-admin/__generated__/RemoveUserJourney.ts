/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveUserJourney
// ====================================================

export interface RemoveUserJourney_userJourneyRemoveAll {
  __typename: "UserJourney";
  id: string;
}

export interface RemoveUserJourney {
  /**
   * Removes all userJourneys associated with a journeyId
   */
  userJourneyRemoveAll: RemoveUserJourney_userJourneyRemoveAll[];
}

export interface RemoveUserJourneyVariables {
  id: string;
}
