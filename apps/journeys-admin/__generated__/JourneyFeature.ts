/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyFeature
// ====================================================

export interface JourneyFeature_journeyFeature {
  __typename: "Journey";
  id: string | null;
  featuredAt: any | null;
}

export interface JourneyFeature {
  /**
   * Sets journey status to featured
   */
  journeyFeature: JourneyFeature_journeyFeature | null;
}

export interface JourneyFeatureVariables {
  id: string;
  feature: boolean;
}
