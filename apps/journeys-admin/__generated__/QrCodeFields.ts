/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: QrCodeFields
// ====================================================

export interface QrCodeFields_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface QrCodeFields_shortLink {
  __typename: "ShortLink";
  domain: QrCodeFields_shortLink_domain;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  /**
   * the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to
   */
  to: string;
}

export interface QrCodeFields {
  __typename: "QrCode";
  id: string;
  toJourneyId: string | null;
  /**
   * ShortLink that handles the redirection
   */
  shortLink: QrCodeFields_shortLink;
}
