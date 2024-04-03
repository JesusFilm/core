/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyCollectionDelete
// ====================================================

export interface JourneyCollectionDelete_journeyCollectionDelete_customDomains_journeyCollection {
  __typename: "JourneyCollection";
  id: string;
}

export interface JourneyCollectionDelete_journeyCollectionDelete_customDomains {
  __typename: "CustomDomain";
  id: string;
  journeyCollection: JourneyCollectionDelete_journeyCollectionDelete_customDomains_journeyCollection | null;
}

export interface JourneyCollectionDelete_journeyCollectionDelete {
  __typename: "JourneyCollection";
  id: string;
  customDomains: JourneyCollectionDelete_journeyCollectionDelete_customDomains[] | null;
}

export interface JourneyCollectionDelete {
  journeyCollectionDelete: JourneyCollectionDelete_journeyCollectionDelete;
}

export interface JourneyCollectionDeleteVariables {
  id: string;
}
