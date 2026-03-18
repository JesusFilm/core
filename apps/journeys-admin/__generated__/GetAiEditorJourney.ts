/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAiEditorJourney
// ====================================================

export interface GetAiEditorJourney_journey {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
}

export interface GetAiEditorJourney {
  journey: GetAiEditorJourney_journey;
}

export interface GetAiEditorJourneyVariables {
  id: string;
}
