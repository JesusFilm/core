/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteJourneyCollection
// ====================================================

export interface DeleteJourneyCollection_journeyCollectionDelete_customDomains_journeyCollection {
  __typename: "JourneyCollection";
  id: string | null;
}

export interface DeleteJourneyCollection_journeyCollectionDelete_customDomains {
  __typename: "CustomDomain";
  id: string | null;
  journeyCollection: DeleteJourneyCollection_journeyCollectionDelete_customDomains_journeyCollection | null;
}

export interface DeleteJourneyCollection_journeyCollectionDelete {
  __typename: "JourneyCollection";
  id: string | null;
  customDomains: DeleteJourneyCollection_journeyCollectionDelete_customDomains[] | null;
}

export interface DeleteJourneyCollection {
  journeyCollectionDelete: DeleteJourneyCollection_journeyCollectionDelete;
}

export interface DeleteJourneyCollectionVariables {
  id: string;
}
