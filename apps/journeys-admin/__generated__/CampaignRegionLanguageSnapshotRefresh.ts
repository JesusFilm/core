/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRegionLanguageSnapshotRefresh
// ====================================================

export interface CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_language_name[];
}

export interface CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_journey {
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

export interface CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_qrCode_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_qrCode_shortLink {
  __typename: "ShortLink";
  id: string;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  domain: CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_qrCode_shortLink_domain;
}

export interface CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_qrCode {
  __typename: "QrCode";
  id: string;
  shortLink: CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_qrCode_shortLink;
}

export interface CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh {
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
  language: CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_language;
  journey: CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_journey | null;
  /**
   * The Campaign QR Code, present from the moment a journey is linked; its short link is the Share Link.
   */
  qrCode: CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh_qrCode | null;
}

export interface CampaignRegionLanguageSnapshotRefresh {
  /**
   * "Refresh from journey": re-read the linked journey’s title and description from the public journey and replace the Share Language’s snapshot with them. The snapshot is the journey’s own language, so only those two values change; nothing else on the row is touched. Never automatic — the editor runs it on request, as a Command whose undo writes the previous snapshot back through `campaignRegionLanguageUpdate`.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `journeyId`): no journey is linked.
   * - BAD_USER_INPUT (field: `url`): "Journey not found or not published" — the linked journey is no longer live.
   */
  campaignRegionLanguageSnapshotRefresh: CampaignRegionLanguageSnapshotRefresh_campaignRegionLanguageSnapshotRefresh;
}

export interface CampaignRegionLanguageSnapshotRefreshVariables {
  id: string;
}
