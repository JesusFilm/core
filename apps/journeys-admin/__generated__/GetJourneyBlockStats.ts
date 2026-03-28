/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyBlockStats
// ====================================================

export interface GetJourneyBlockStats_journey_blocks {
  __typename: string;
  id: string;
}

export interface GetJourneyBlockStats_journey {
  __typename: "Journey";
  id: string;
  blocks: GetJourneyBlockStats_journey_blocks[] | null;
}

export interface GetJourneyBlockStats {
  journey: GetJourneyBlockStats_journey | null;
}

export interface GetJourneyBlockStatsVariables {
  id: string;
}
