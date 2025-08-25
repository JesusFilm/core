/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { QrCodeCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: QrCodeCreate
// ====================================================

export interface QrCodeCreate_qrCodeCreate_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface QrCodeCreate_qrCodeCreate_shortLink {
  __typename: "ShortLink";
  id: string | null;
  domain: QrCodeCreate_qrCodeCreate_shortLink_domain;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  /**
   * the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to
   */
  to: string;
}

export interface QrCodeCreate_qrCodeCreate {
  __typename: "QrCode";
  id: string | null;
  toJourneyId: string | null;
  shortLink: QrCodeCreate_qrCodeCreate_shortLink | null;
}

export interface QrCodeCreate {
  qrCodeCreate: QrCodeCreate_qrCodeCreate;
}

export interface QrCodeCreateVariables {
  input: QrCodeCreateInput;
}
