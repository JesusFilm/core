/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyBlockTypes
// ====================================================

export interface GetJourneyBlockTypes_journey {
  __typename: "Journey";
  id: string;
  /**
   * Distinct block typenames present on this journey (non-deleted blocks only)
   */
  blockTypenames: string[];
}

export interface GetJourneyBlockTypes {
  journey: GetJourneyBlockTypes_journey;
}

export interface GetJourneyBlockTypesVariables {
  id: string;
}
