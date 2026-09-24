/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignUpdateInput, CampaignStatus, TemplateGalleryPageMediaType, JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignUpdate
// ====================================================

export interface CampaignUpdate_campaignUpdate_team {
  __typename: "Team";
  id: string;
}

export interface CampaignUpdate_campaignUpdate_media {
  __typename: "CampaignMedia";
  id: string;
  /**
   * Active selector for which payload renders.
   */
  type: TemplateGalleryPageMediaType;
  /**
   * Raw Mux video id of the stored upload payload. Authenticated-only — never exposed on the public type.
   */
  muxVideoId: string | null;
  /**
   * The stored link payload. May be retained while `type` is `mux`/`none` so the editor can offer switching back.
   */
  embedUrl: string | null;
  /**
   * Mux playback ID denormalized at save time. Tracks `muxVideoId`.
   */
  muxPlaybackId: string | null;
  /**
   * Video name denormalized at save time. Tracks `muxVideoId`.
   */
  muxName: string | null;
  /**
   * Video duration in seconds denormalized at save time. Tracks `muxVideoId`.
   */
  muxDuration: number | null;
}

export interface CampaignUpdate_campaignUpdate_shareJourneys_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignUpdate_campaignUpdate_shareJourneys_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignUpdate_campaignUpdate_shareJourneys_language_name[];
}

export interface CampaignUpdate_campaignUpdate_shareJourneys_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface CampaignUpdate_campaignUpdate_shareJourneys {
  __typename: "CampaignJourneyItem";
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: JourneyStatus;
  createdAt: any;
  customizable: boolean | null;
  language: CampaignUpdate_campaignUpdate_shareJourneys_language;
  primaryImageBlock: CampaignUpdate_campaignUpdate_shareJourneys_primaryImageBlock | null;
}

export interface CampaignUpdate_campaignUpdate_templateJourneys_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignUpdate_campaignUpdate_templateJourneys_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignUpdate_campaignUpdate_templateJourneys_language_name[];
}

export interface CampaignUpdate_campaignUpdate_templateJourneys_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface CampaignUpdate_campaignUpdate_templateJourneys {
  __typename: "CampaignJourneyItem";
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: JourneyStatus;
  createdAt: any;
  customizable: boolean | null;
  language: CampaignUpdate_campaignUpdate_templateJourneys_language;
  primaryImageBlock: CampaignUpdate_campaignUpdate_templateJourneys_primaryImageBlock | null;
}

export interface CampaignUpdate_campaignUpdate {
  __typename: "Campaign";
  id: string;
  title: string;
  /**
   * URL-safe identifier. The public page is reached at `/campaign/<slug>`. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, and must not be in the reserved list. Mutable after publish — changing it breaks any external links to the old URL.
   */
  slug: string;
  eyebrow: string | null;
  tagline: string | null;
  description: string;
  backgroundImageSrc: string | null;
  backgroundImageAlt: string | null;
  /**
   * `draft` hides the campaign from the public renderer; `published` exposes it via `campaignBySlug`.
   */
  status: CampaignStatus;
  /**
   * Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the campaign has not yet been published.
   */
  publishedAt: any | null;
  /**
   * Lower bound of the country-stats date range.
   */
  statsFrom: any;
  createdAt: any;
  updatedAt: any;
  /**
   * Owning team. The campaign is hard-deleted when the team is deleted.
   */
  team: CampaignUpdate_campaignUpdate_team;
  /**
   * Embedded hero media with both retained payload slots and the raw `muxVideoId`. `null` only when the campaign has no media row.
   */
  media: CampaignUpdate_campaignUpdate_media | null;
  /**
   * Share-panel journeys in display order: same-team, non-template, non-soft-deleted journeys attached with role `share`. Drafts are included on this authenticated projection.
   */
  shareJourneys: CampaignUpdate_campaignUpdate_shareJourneys[];
  /**
   * Customizable-collection journeys in display order: same-team, template-flagged, non-soft-deleted journeys attached with role `template`. Drafts are included on this authenticated projection.
   */
  templateJourneys: CampaignUpdate_campaignUpdate_templateJourneys[];
}

export interface CampaignUpdate {
  /**
   * Update editable fields of a Campaign. All input fields are optional: a field omitted leaves the existing value alone, a field set to `null` clears it (where nullable). When `shareJourneyIds` / `templateJourneyIds` is provided, that role's list is replaced in the given order (other role untouched). Allowed on both `draft` and `published` campaigns.
   * 
   * Auth: caller must be a member of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the campaign's team.
   * - BAD_USER_INPUT (field: `slug`): user-supplied slug fails shape, length, reserved-word, or uniqueness checks.
   * - BAD_USER_INPUT (field: `backgroundImageSrc`): URL is not https.
   * - BAD_USER_INPUT (field: `shareJourneyIds` / `templateJourneyIds`): more than 100 ids.
   * - CONFLICT (field: `media` / `journeys`): a concurrent write touched the same rows; retry.
   */
  campaignUpdate: CampaignUpdate_campaignUpdate;
}

export interface CampaignUpdateVariables {
  id: string;
  input: CampaignUpdateInput;
}
