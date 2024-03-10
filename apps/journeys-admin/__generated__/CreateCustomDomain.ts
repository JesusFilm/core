/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomDomainCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateCustomDomain
// ====================================================

export interface CreateCustomDomain_customDomainCreate_verification {
  __typename: "VercelDomainVerification";
  domain: string | null;
  reason: string | null;
  type: string | null;
  value: string | null;
}

export interface CreateCustomDomain_customDomainCreate {
  __typename: "CustomDomain";
  id: string;
  apexName: string;
  name: string;
  allowOutsideJourneys: boolean;
  verification: (CreateCustomDomain_customDomainCreate_verification | null)[] | null;
  verified: boolean;
}

export interface CreateCustomDomain {
  customDomainCreate: CreateCustomDomain_customDomainCreate;
}

export interface CreateCustomDomainVariables {
  input: CustomDomainCreateInput;
}
