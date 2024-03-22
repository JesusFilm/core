/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomDomainCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateCustomDomain
// ====================================================

export interface CreateCustomDomain_customDomainCreate_verification_verification {
  __typename: "VercelDomainVerification";
  domain: string | null;
  reason: string | null;
  type: string | null;
  value: string | null;
}

export interface CreateCustomDomain_customDomainCreate_verification {
  __typename: "CustomDomainVerification";
  verified: boolean;
  verification: (CreateCustomDomain_customDomainCreate_verification_verification | null)[] | null;
}

export interface CreateCustomDomain_customDomainCreate_configuration {
  __typename: "VercelDomainConfiguration";
  misconfigured: boolean | null;
}

export interface CreateCustomDomain_customDomainCreate_journeyCollection_journeys {
  __typename: "Journey";
  id: string;
  title: string;
}

export interface CreateCustomDomain_customDomainCreate_journeyCollection {
  __typename: "JourneyCollection";
  id: string;
  journeys: CreateCustomDomain_customDomainCreate_journeyCollection_journeys[] | null;
}

export interface CreateCustomDomain_customDomainCreate {
  __typename: "CustomDomain";
  id: string;
  apexName: string;
  name: string;
  verification: CreateCustomDomain_customDomainCreate_verification | null;
  configuration: CreateCustomDomain_customDomainCreate_configuration | null;
  journeyCollection: CreateCustomDomain_customDomainCreate_journeyCollection | null;
}

export interface CreateCustomDomain {
  customDomainCreate: CreateCustomDomain_customDomainCreate;
}

export interface CreateCustomDomainVariables {
  input: CustomDomainCreateInput;
}
