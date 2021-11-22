/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourney
// ====================================================

export interface GetJourney_journey_primaryImageBlock {
  __typename: "ImageBlock";
  src: string;
}

export interface GetJourney_journey {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
  primaryImageBlock: GetJourney_journey_primaryImageBlock | null;
}

export interface GetJourney {
  journey: GetJourney_journey | null;
}

export interface GetJourneyVariables {
  id: string;
}
