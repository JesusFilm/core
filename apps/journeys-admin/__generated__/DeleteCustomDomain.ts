/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteCustomDomain
// ====================================================

export interface DeleteCustomDomain_customDomainDelete {
  __typename: "CustomDomain";
  id: string | null;
}

export interface DeleteCustomDomain {
  customDomainDelete: DeleteCustomDomain_customDomainDelete | null;
}

export interface DeleteCustomDomainVariables {
  customDomainId: string;
}
