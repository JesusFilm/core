/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { QrCodeUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: QrCodeUpdate
// ====================================================

export interface QrCodeUpdate_qrCodeUpdate_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface QrCodeUpdate_qrCodeUpdate_shortLink {
  __typename: "ShortLink";
  id: string;
  domain: QrCodeUpdate_qrCodeUpdate_shortLink_domain;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  /**
   * the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to
   */
  to: string;
}

export interface QrCodeUpdate_qrCodeUpdate {
  __typename: "QrCode";
  id: string;
  toJourneyId: string | null;
  /**
   * ShortLink that handles the redirection
   */
  shortLink: QrCodeUpdate_qrCodeUpdate_shortLink;
}

export interface QrCodeUpdate {
  qrCodeUpdate: QrCodeUpdate_qrCodeUpdate;
}

export interface QrCodeUpdateVariables {
  id: string;
  input: QrCodeUpdateInput;
}
