/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRegionCreate
// ====================================================

export interface CampaignRegionCreate_campaignRegionCreate_languages_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignRegionCreate_campaignRegionCreate_languages_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignRegionCreate_campaignRegionCreate_languages_language_name[];
}

export interface CampaignRegionCreate_campaignRegionCreate_languages_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  status: JourneyStatus;
}

export interface CampaignRegionCreate_campaignRegionCreate_languages_qrCode_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface CampaignRegionCreate_campaignRegionCreate_languages_qrCode_shortLink {
  __typename: "ShortLink";
  id: string;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  domain: CampaignRegionCreate_campaignRegionCreate_languages_qrCode_shortLink_domain;
}

export interface CampaignRegionCreate_campaignRegionCreate_languages_qrCode {
  __typename: "QrCode";
  id: string;
  shortLink: CampaignRegionCreate_campaignRegionCreate_languages_qrCode_shortLink;
}

export interface CampaignRegionCreate_campaignRegionCreate_languages {
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
  language: CampaignRegionCreate_campaignRegionCreate_languages_language;
  journey: CampaignRegionCreate_campaignRegionCreate_languages_journey | null;
  /**
   * The Campaign QR Code, present from the moment a journey is linked; its short link is the Share Link.
   */
  qrCode: CampaignRegionCreate_campaignRegionCreate_languages_qrCode | null;
}

export interface CampaignRegionCreate_campaignRegionCreate_countries_country_name {
  __typename: "CountryName";
  value: string;
}

export interface CampaignRegionCreate_campaignRegionCreate_countries_country {
  __typename: "Country";
  id: string;
  flagPngSrc: string | null;
  name: CampaignRegionCreate_campaignRegionCreate_countries_country_name[];
}

export interface CampaignRegionCreate_campaignRegionCreate_countries {
  __typename: "CampaignRegionCountry";
  id: string;
  regionId: string;
  /**
   * api-languages Country id.
   */
  countryId: string;
  order: number;
  /**
   * The api-languages Country, resolved through federation: flag and translated name live there.
   */
  country: CampaignRegionCreate_campaignRegionCreate_countries_country;
}

export interface CampaignRegionCreate_campaignRegionCreate {
  __typename: "CampaignRegion";
  id: string;
  campaignId: string;
  /**
   * Required, at most 60 characters.
   */
  name: string;
  /**
   * Unique within the campaign. Changing it breaks links already shared to the region page.
   */
  slug: string;
  order: number;
  /**
   * Whether the region appears on the Region Switcher.
   */
  listed: boolean;
  /**
   * Share Languages in selector order.
   */
  languages: CampaignRegionCreate_campaignRegionCreate_languages[];
  /**
   * Region Countries in chip order.
   */
  countries: CampaignRegionCreate_campaignRegionCreate_countries[];
}

export interface CampaignRegionCreate {
  /**
   * Add a Campaign Region from the Region Switcher’s "+ Add": born named "New region" in the campaign default language, slugged from that name (`new-region`, `new-region-2`, …), appended last, listed, with no lines or countries and one Share Language row for the campaign default language with no journey yet. Nothing is copied: every region renders the shared Region Page.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Idempotent per id: a retry with the id of an existing region of the same campaign returns that region.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - CONFLICT: a concurrent create took the id or the derived slug; retry.
   */
  campaignRegionCreate: CampaignRegionCreate_campaignRegionCreate;
}

export interface CampaignRegionCreateVariables {
  campaignId: string;
  id?: string | null;
}
