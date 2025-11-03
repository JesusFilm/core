/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyCreatedAt
// ====================================================

export interface GetJourneyCreatedAt_journey {
  __typename: "Journey";
  id: string;
  createdAt: any;
}

export interface GetJourneyCreatedAt {
  journey: GetJourneyCreatedAt_journey;
}

export interface GetJourneyCreatedAtVariables {
  id: string;
}
