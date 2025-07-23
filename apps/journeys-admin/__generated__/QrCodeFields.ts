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
  id: string | null;
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
  id: string | null;
  toJourneyId: string | null;
  shortLink: QrCodeFields_shortLink | null;
}
