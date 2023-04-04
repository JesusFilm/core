/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserJourneyRemove
// ====================================================

export interface UserJourneyRemove_userJourneyRemove_journey {
  __typename: "Journey";
  id: string;
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
  id: string;
}
