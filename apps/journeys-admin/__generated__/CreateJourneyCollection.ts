/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyCollectionCreateInput, CustomDomainUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateJourneyCollection
// ====================================================

export interface CreateJourneyCollection_journeyCollectionCreate_journeys {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
}

export interface CreateJourneyCollection_journeyCollectionCreate {
  __typename: "JourneyCollection";
  id: string | null;
  journeys: CreateJourneyCollection_journeyCollectionCreate_journeys[] | null;
}

export interface CreateJourneyCollection_customDomainUpdate_journeyCollection_journeys {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
}

export interface CreateJourneyCollection_customDomainUpdate_journeyCollection {
  __typename: "JourneyCollection";
  id: string | null;
  journeys: CreateJourneyCollection_customDomainUpdate_journeyCollection_journeys[] | null;
}

export interface CreateJourneyCollection_customDomainUpdate {
  __typename: "CustomDomain";
  id: string | null;
  journeyCollection: CreateJourneyCollection_customDomainUpdate_journeyCollection | null;
}

export interface CreateJourneyCollection {
  journeyCollectionCreate: CreateJourneyCollection_journeyCollectionCreate;
  customDomainUpdate: CreateJourneyCollection_customDomainUpdate | null;
}

export interface CreateJourneyCollectionVariables {
  journeyCollectionInput: JourneyCollectionCreateInput;
  customDomainId: string;
  customDomainUpdateInput: CustomDomainUpdateInput;
}
