/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomDomainCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateCustomDomain
// ====================================================

export interface CreateCustomDomain_customDomainCreate_journeyCollection_journeys {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
}

export interface CreateCustomDomain_customDomainCreate_journeyCollection {
  __typename: "JourneyCollection";
  id: string | null;
  journeys: CreateCustomDomain_customDomainCreate_journeyCollection_journeys[] | null;
}

export interface CreateCustomDomain_customDomainCreate {
  __typename: "CustomDomain";
  id: string | null;
  apexName: string | null;
  name: string | null;
  journeyCollection: CreateCustomDomain_customDomainCreate_journeyCollection | null;
}

export interface CreateCustomDomain {
  customDomainCreate: CreateCustomDomain_customDomainCreate | null;
}

export interface CreateCustomDomainVariables {
  input: CustomDomainCreateInput;
}
