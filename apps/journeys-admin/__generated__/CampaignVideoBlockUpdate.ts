/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignVideoBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, CampaignMediaSide, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignVideoBlockUpdate
// ====================================================

export interface CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video_title_language {
  __typename: "Language";
  id: string;
}

export interface CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video_title_language;
}

export interface CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
  title: CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video_title[];
  images: CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video_images[];
  variant: CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video_variant | null;
}

export interface CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  playbackId: string | null;
}

export interface CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo = CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_Video | CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_MuxVideo | CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo_YouTube;

export interface CampaignVideoBlockUpdate_campaignVideoBlockUpdate {
  __typename: "CampaignVideoBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  /**
   * Always `internal`, `youTube` or `mux`.
   */
  source: VideoBlockSource | null;
  /**
   * The Watch Video id, the YouTube video id or the Mux video id, by `source`.
   */
  videoId: string | null;
  /**
   * For `internal`: the campaign language at link time; the language `mediaVideo` resolves in.
   */
  videoVariantLanguageId: string | null;
  /**
   * The author’s override (at most 200 characters), or for YouTube and Mux the title captured at pick. Null on a Watch video means the Video’s own title.
   */
  title: string | null;
  /**
   * The author’s override (at most 1000 characters), or for YouTube the description captured at pick. Null on a Watch video means the Video’s own text.
   */
  description: string | null;
  /**
   * The poster captured at pick for YouTube and Mux; null for a Watch video (read through `mediaVideo`).
   */
  image: string | null;
  /**
   * Seconds, captured at pick for YouTube and Mux.
   */
  duration: number | null;
  /**
   * The federated video reference (`Video`, `YouTube` or `MuxVideo` by `source`, with `id` and `primaryLanguageId`); the gateway resolves it, api-journeys never does.
   */
  mediaVideo: CampaignVideoBlockUpdate_campaignVideoBlockUpdate_mediaVideo | null;
}

export interface CampaignVideoBlockUpdate {
  /**
   * Set or clear a Campaign Video's default-language title and description overrides. Only the given fields change; translations are untouched. Null (or empty) falls back to the source text: a Watch video's is read live, so the column is cleared; a YouTube or Mux video's is fetched again and stored.
   * 
   * Auth: campaign Update — any member or manager of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignVideoBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title` / `description`): over 200 / 1000 characters.
   */
  campaignVideoBlockUpdate: CampaignVideoBlockUpdate_campaignVideoBlockUpdate;
}

export interface CampaignVideoBlockUpdateVariables {
  id: string;
  input: CampaignVideoBlockUpdateInput;
  languageId?: string | null;
}
