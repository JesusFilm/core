/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AiUpdateJourney
// ====================================================

export interface AiUpdateJourney_journeyUpdate {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
}

export interface AiUpdateJourney {
  journeyUpdate: AiUpdateJourney_journeyUpdate;
}

export interface AiUpdateJourneyVariables {
  id: string;
  title?: string | null;
  description?: string | null;
}
