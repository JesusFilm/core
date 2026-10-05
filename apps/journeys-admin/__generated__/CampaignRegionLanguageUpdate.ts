/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignRegionLanguageUpdateInput, JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRegionLanguageUpdate
// ====================================================

export interface CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_language_name[];
}

export interface CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  status: JourneyStatus;
}

export interface CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_qrCode_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_qrCode_shortLink {
  __typename: "ShortLink";
  id: string;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  domain: CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_qrCode_shortLink_domain;
}

export interface CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_qrCode {
  __typename: "QrCode";
  id: string;
  shortLink: CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_qrCode_shortLink;
}

export interface CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate {
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
  language: CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_language;
  journey: CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_journey | null;
  /**
   * The Campaign QR Code, present from the moment a journey is linked; its short link is the Share Link.
   */
  qrCode: CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate_qrCode | null;
}

export interface CampaignRegionLanguageUpdate {
  /**
   * Link, swap, unlink or re-describe the journey a Share Language hands out. A pasted `url` (admin link or public URL on any domain) resolves to a live-published journey of any team with the routing filter skipped, and its title and description are snapshotted; `journeyId` links by id or, as `null`, unlinks. The Campaign QR Code follows in the same step: linking creates a `QrCode` row in the campaign’s team with its short link (drafts too, never lazily), swapping retargets the same short link so printed codes stay valid, unlinking deletes the row and its short link. Linking another team’s journey needs no rights there and creates no journey access row. `title` and `description` edit the snapshot.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `url` / `journeyId`): not a journey link, or "Journey not found or not published".
   * - BAD_USER_INPUT (field: `title` / `description`): over the length cap.
   */
  campaignRegionLanguageUpdate: CampaignRegionLanguageUpdate_campaignRegionLanguageUpdate;
}

export interface CampaignRegionLanguageUpdateVariables {
  id: string;
  input: CampaignRegionLanguageUpdateInput;
}
