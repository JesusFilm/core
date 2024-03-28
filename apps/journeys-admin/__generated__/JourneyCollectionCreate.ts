/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyCollectionCreateInput, CustomDomainUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyCollectionCreate
// ====================================================

export interface JourneyCollectionCreate_journeyCollectionCreate_journeys {
  __typename: "Journey";
  id: string;
  title: string;
}

export interface JourneyCollectionCreate_journeyCollectionCreate {
  __typename: "JourneyCollection";
  id: string;
  journeys: JourneyCollectionCreate_journeyCollectionCreate_journeys[] | null;
}

export interface JourneyCollectionCreate_customDomainUpdate_journeyCollection_journeys {
  __typename: "Journey";
  id: string;
  title: string;
}

export interface JourneyCollectionCreate_customDomainUpdate_journeyCollection {
  __typename: "JourneyCollection";
  id: string;
  journeys: JourneyCollectionCreate_customDomainUpdate_journeyCollection_journeys[] | null;
}

export interface JourneyCollectionCreate_customDomainUpdate {
  __typename: "CustomDomain";
  id: string;
  journeyCollection: JourneyCollectionCreate_customDomainUpdate_journeyCollection | null;
}

export interface JourneyCollectionCreate {
  journeyCollectionCreate: JourneyCollectionCreate_journeyCollectionCreate;
  customDomainUpdate: JourneyCollectionCreate_customDomainUpdate;
}

export interface JourneyCollectionCreateVariables {
  journeyCollectionInput: JourneyCollectionCreateInput;
  customDomainUpdateInput: CustomDomainUpdateInput;
}
