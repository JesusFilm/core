/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CheckCustomDomain
// ====================================================

export interface CheckCustomDomain_customDomainCheck_verification {
  __typename: "CustomDomainVerification";
  domain: string;
  reason: string;
  type: string;
  value: string;
}

export interface CheckCustomDomain_customDomainCheck_verificationResponse {
  __typename: "CustomDomainVerificationResponse";
  code: string;
  message: string;
}

export interface CheckCustomDomain_customDomainCheck {
  __typename: "CustomDomainCheck";
  configured: boolean;
  verified: boolean;
  verification: CheckCustomDomain_customDomainCheck_verification[] | null;
  verificationResponse: CheckCustomDomain_customDomainCheck_verificationResponse | null;
}

export interface CheckCustomDomain {
  customDomainCheck: CheckCustomDomain_customDomainCheck;
}

export interface CheckCustomDomainVariables {
  customDomainId: string;
}
