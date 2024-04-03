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
  /**
   * Is the domain correctly configured in the DNS?
   * If false, A Record and CNAME Record should be added by the user.
   */
  configured: boolean;
  /**
   * Verification records to be added to the DNS to confirm ownership.
   */
  verification: CheckCustomDomain_customDomainCheck_verification[] | null;
  /**
   * Does the domain belong to the team?
   * If false, verification and verificationResponse will be populated.
   */
  verified: boolean;
  /**
   * Reasoning as to why verification is required.
   */
  verificationResponse: CheckCustomDomain_customDomainCheck_verificationResponse | null;
}

export interface CheckCustomDomain {
  customDomainCheck: CheckCustomDomain_customDomainCheck;
}

export interface CheckCustomDomainVariables {
  id: string;
}
