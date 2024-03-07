/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomDomainCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateCustomDomain
// ====================================================

export interface CreateCustomDomain_customDomainCreate {
  __typename: "CustomDomain";
  id: string;
  name: string;
  defaultJourneysOnly: boolean;
}

export interface CreateCustomDomain {
  customDomainCreate: CreateCustomDomain_customDomainCreate;
}

export interface CreateCustomDomainVariables {
  teamId: string;
  input: CustomDomainCreateInput;
}
