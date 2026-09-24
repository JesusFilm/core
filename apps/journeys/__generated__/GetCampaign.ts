/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageMediaType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCampaign
// ====================================================

export interface GetCampaign_campaignBySlug_media {
  __typename: "CampaignMediaPublic";
  id: string;
  /**
   * Active selector for which payload renders.
   */
  type: TemplateGalleryPageMediaType;
  /**
   * Server-normalized iframe URL. Non-null only when `type` is `link`.
   */
  embedUrl: string | null;
  /**
   * Mux playback ID. Non-null only when `type` is `mux`.
   */
  muxPlaybackId: string | null;
}

export interface GetCampaign_campaignBySlug_shareJourneys_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetCampaign_campaignBySlug_shareJourneys_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: GetCampaign_campaignBySlug_shareJourneys_language_name[];
}

export interface GetCampaign_campaignBySlug_shareJourneys {
  __typename: "CampaignJourneyItem";
  id: string;
  title: string;
  slug: string;
  language: GetCampaign_campaignBySlug_shareJourneys_language;
}

export interface GetCampaign_campaignBySlug_templateJourneys_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetCampaign_campaignBySlug_templateJourneys_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: GetCampaign_campaignBySlug_templateJourneys_language_name[];
}

export interface GetCampaign_campaignBySlug_templateJourneys_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export interface GetCampaign_campaignBySlug_templateJourneys {
  __typename: "CampaignJourneyItem";
  id: string;
  title: string;
  description: string | null;
  slug: string;
  createdAt: any;
  template: boolean | null;
  customizable: boolean | null;
  website: boolean | null;
  language: GetCampaign_campaignBySlug_templateJourneys_language;
  primaryImageBlock: GetCampaign_campaignBySlug_templateJourneys_primaryImageBlock | null;
}

export interface GetCampaign_campaignBySlug {
  __typename: "CampaignPublic";
  id: string;
  /**
   * URL-safe identifier. The public page is reached at `/campaign/<slug>`. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, and must not be in the reserved list. Mutable after publish — changing it breaks any external links to the old URL.
   */
  slug: string;
  title: string;
  eyebrow: string | null;
  tagline: string | null;
  description: string;
  backgroundImageSrc: string | null;
  backgroundImageAlt: string | null;
  /**
   * Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the campaign has not yet been published.
   */
  publishedAt: any | null;
  /**
   * Embedded hero media, or `null` when nothing renders (no media, `type: none`, or the active slot is empty). Only the active payload is ever exposed.
   */
  media: GetCampaign_campaignBySlug_media | null;
  /**
   * Share-panel journeys in display order: same-team, non-template, non-soft-deleted journeys attached with role `share`. Published journeys only.
   */
  shareJourneys: GetCampaign_campaignBySlug_shareJourneys[];
  /**
   * Customizable-collection journeys in display order: same-team, template-flagged, non-soft-deleted journeys attached with role `template`. Published journeys only.
   */
  templateJourneys: GetCampaign_campaignBySlug_templateJourneys[];
}

export interface GetCampaign_campaignCountryStats_countries {
  __typename: "CampaignCountryStat";
  /**
   * ISO 3166-1 alpha-2 code as reported by Plausible.
   */
  countryCode: string;
  /**
   * English display name resolved server-side; null when the code is not recognised.
   */
  countryName: string | null;
  /**
   * Unique visitors (the product-facing "views" number).
   */
  visitors: number;
  /**
   * Total step pageviews.
   */
  pageviews: number;
}

export interface GetCampaign_campaignCountryStats {
  __typename: "CampaignCountryStats";
  from: any;
  to: any;
  /**
   * Sum of visitors over every row, including rows with an unknown country.
   */
  totalVisitors: number;
  /**
   * Sum of pageviews over every row, including rows with an unknown country.
   */
  totalPageviews: number;
  countries: GetCampaign_campaignCountryStats_countries[];
}

export interface GetCampaign {
  /**
   * Public, unauthenticated read by slug. Returns the Campaign with the given slug, but ONLY if it is currently `published`. Returns null for: unknown slug, draft slug, malformed slug (does not match `^[a-z0-9]+(-[a-z0-9]+)*$`), or slug exceeding 200 characters.
   */
  campaignBySlug: GetCampaign_campaignBySlug | null;
  /**
   * Public country breakdown of a published campaign's share-journey traffic, aggregated server-side from Plausible. Returns null for unknown, draft or malformed slugs. Cached for a few minutes.
   */
  campaignCountryStats: GetCampaign_campaignCountryStats | null;
}

export interface GetCampaignVariables {
  slug: string;
}
