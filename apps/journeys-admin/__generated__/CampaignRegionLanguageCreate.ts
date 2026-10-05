/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRegionLanguageCreate
// ====================================================

export interface CampaignRegionLanguageCreate_campaignRegionLanguageCreate_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignRegionLanguageCreate_campaignRegionLanguageCreate_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignRegionLanguageCreate_campaignRegionLanguageCreate_language_name[];
}

export interface CampaignRegionLanguageCreate_campaignRegionLanguageCreate_journey {
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

export interface CampaignRegionLanguageCreate_campaignRegionLanguageCreate_qrCode_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface CampaignRegionLanguageCreate_campaignRegionLanguageCreate_qrCode_shortLink {
  __typename: "ShortLink";
  id: string;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  domain: CampaignRegionLanguageCreate_campaignRegionLanguageCreate_qrCode_shortLink_domain;
}

export interface CampaignRegionLanguageCreate_campaignRegionLanguageCreate_qrCode {
  __typename: "QrCode";
  id: string;
  shortLink: CampaignRegionLanguageCreate_campaignRegionLanguageCreate_qrCode_shortLink;
}

export interface CampaignRegionLanguageCreate_campaignRegionLanguageCreate {
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
  language: CampaignRegionLanguageCreate_campaignRegionLanguageCreate_language;
  journey: CampaignRegionLanguageCreate_campaignRegionLanguageCreate_journey | null;
  /**
   * The Campaign QR Code, present from the moment a journey is linked; its short link is the Share Link.
   */
  qrCode: CampaignRegionLanguageCreate_campaignRegionLanguageCreate_qrCode | null;
}

export interface CampaignRegionLanguageCreate {
  /**
   * Add a Share Language to a Campaign Region, appended last in selector order with no journey yet (an Unlinked Language). The id is an api-languages Language id; a share language need not be a campaign language. Paste a journey through `campaignRegionLanguageUpdate` to link it.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: regionId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `languageId`): not an api-languages language, or already on the region.
   */
  campaignRegionLanguageCreate: CampaignRegionLanguageCreate_campaignRegionLanguageCreate;
}

export interface CampaignRegionLanguageCreateVariables {
  regionId: string;
  languageId: string;
}
