/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyFeature
// ====================================================

export interface JourneyFeature_journeyFeature {
  __typename: "Journey";
  id: string;
  featuredAt: any | null;
}

export interface JourneyFeature {
  journeyFeature: JourneyFeature_journeyFeature;
}

export interface JourneyFeatureVariables {
  id: string;
  feature: boolean;
}
