/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL fragment: CampaignRegionFields
// ====================================================

export interface CampaignRegionFields_languages_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignRegionFields_languages_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignRegionFields_languages_language_name[];
}

export interface CampaignRegionFields_languages_journey {
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

export interface CampaignRegionFields_languages_qrCode_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface CampaignRegionFields_languages_qrCode_shortLink {
  __typename: "ShortLink";
  id: string;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  domain: CampaignRegionFields_languages_qrCode_shortLink_domain;
}

export interface CampaignRegionFields_languages_qrCode {
  __typename: "QrCode";
  id: string;
  shortLink: CampaignRegionFields_languages_qrCode_shortLink;
}

export interface CampaignRegionFields_languages {
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
  language: CampaignRegionFields_languages_language;
  journey: CampaignRegionFields_languages_journey | null;
  /**
   * The Campaign QR Code, present from the moment a journey is linked; its short link is the Share Link.
   */
  qrCode: CampaignRegionFields_languages_qrCode | null;
}

export interface CampaignRegionFields_countries_country_name {
  __typename: "CountryName";
  value: string;
}

export interface CampaignRegionFields_countries_country {
  __typename: "Country";
  id: string;
  flagPngSrc: string | null;
  name: CampaignRegionFields_countries_country_name[];
}

export interface CampaignRegionFields_countries {
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
  country: CampaignRegionFields_countries_country;
}

export interface CampaignRegionFields {
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
  languages: CampaignRegionFields_languages[];
  /**
   * Region Countries in chip order.
   */
  countries: CampaignRegionFields_countries[];
}
