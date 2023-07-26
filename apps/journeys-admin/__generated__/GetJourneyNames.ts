/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyNames
// ====================================================

export interface GetJourneyNames_journeys {
  __typename: "Journey";
  id: string;
  title: string;
}

export interface GetJourneyNames {
  /**
   * returns all journeys that match the provided filters
   * If no team id is provided and template is not true then only returns journeys
   * where the user is not a member of a team but is an editor or owner of the
   * journey
   */
  journeys: GetJourneyNames_journeys[];
}
