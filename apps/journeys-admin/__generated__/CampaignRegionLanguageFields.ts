/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL fragment: CampaignRegionLanguageFields
// ====================================================

export interface CampaignRegionLanguageFields_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignRegionLanguageFields_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignRegionLanguageFields_language_name[];
}

export interface CampaignRegionLanguageFields_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  status: JourneyStatus;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
}

export interface CampaignRegionLanguageFields_qrCode_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface CampaignRegionLanguageFields_qrCode_shortLink {
  __typename: "ShortLink";
  id: string;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  domain: CampaignRegionLanguageFields_qrCode_shortLink_domain;
}

export interface CampaignRegionLanguageFields_qrCode {
  __typename: "QrCode";
  id: string;
  shortLink: CampaignRegionLanguageFields_qrCode_shortLink;
}

export interface CampaignRegionLanguageFields {
  __typename: "CampaignRegionLanguage";
  id: string;
  regionId: string;
  /**
   * api-languages Language id.
   */
  languageId: string;
  journeyId: string | null;
  /**
   * Snapshot of the linked journey's title; the journey's own language, not translated.
   */
  title: string | null;
  description: string | null;
  qrCodeId: string | null;
  order: number;
  language: CampaignRegionLanguageFields_language;
  journey: CampaignRegionLanguageFields_journey | null;
  /**
   * The Campaign QR Code, present from the moment a journey is linked; its short link is the Share Link.
   */
  qrCode: CampaignRegionLanguageFields_qrCode | null;
}
