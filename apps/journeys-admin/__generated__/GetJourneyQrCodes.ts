/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { QrCodesFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyQrCodes
// ====================================================

export interface GetJourneyQrCodes_qrCodes_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface GetJourneyQrCodes_qrCodes_shortLink {
  __typename: "ShortLink";
  id: string;
  domain: GetJourneyQrCodes_qrCodes_shortLink_domain;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  /**
   * the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to
   */
  to: string;
}

export interface GetJourneyQrCodes_qrCodes {
  __typename: "QrCode";
  id: string;
  toJourneyId: string | null;
  /**
   * ShortLink that handles the redirection
   */
  shortLink: GetJourneyQrCodes_qrCodes_shortLink;
}

export interface GetJourneyQrCodes {
  qrCodes: GetJourneyQrCodes_qrCodes[];
}

export interface GetJourneyQrCodesVariables {
  where: QrCodesFilter;
}
