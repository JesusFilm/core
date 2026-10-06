/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignVideoBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, CampaignJourneyListDisplay, CampaignMediaSide, VideoBlockSource, VideoLabel, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignVideoBlockCreate
// ====================================================

export interface CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video_title_language {
  __typename: "Language";
  id: string;
}

export interface CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video_title_language;
}

export interface CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video {
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
  title: CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video_title[];
  images: CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video_images[];
  variant: CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video_variant | null;
}

export interface CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  playbackId: string | null;
}

export interface CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo = CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_Video | CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_MuxVideo | CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo_YouTube;

export interface CampaignVideoBlockCreate_campaignVideoBlockCreate {
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
  mediaVideo: CampaignVideoBlockCreate_campaignVideoBlockCreate_mediaVideo | null;
}

export interface CampaignVideoBlockCreate {
  /**
   * Create a Campaign Video as a child of a section: either filling the Media Slot of a hero or Featured Media section (replacing, soft-deleting, the block the slot held) or adding an explicit item to a video carousel (appended as the next ordered child). YouTube and Mux ids are validated by the VideoBlock zod schemas and their title, description, poster and duration fetched once; a Watch `url` is stripped of its `.html` parts to a variant slug and resolved through the gateway, and only its ids are stored (the variant language is the campaign language). Title and description overrides win over the source text.
   * 
   * Auth: campaign Update — any member or manager of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve; a YouTube or Mux id unknown to its service.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `parentBlockId`): not a live section or chrome block of this campaign.
   * - BAD_USER_INPUT (field: `mediaBlockId`): the section has no Media Slot (only hero and Featured Media do; a carousel takes explicit items instead).
   * - BAD_USER_INPUT (field: `source`): not internal, youTube or mux.
   * - BAD_USER_INPUT (field: `videoId`): not a valid YouTube or Mux id.
   * - BAD_USER_INPUT (field: `url`): "That link isn't a Watch video", or a url on a YouTube or Mux video.
   * - BAD_USER_INPUT (field: `title` / `description`): over 200 / 1000 characters.
   */
  campaignVideoBlockCreate: CampaignVideoBlockCreate_campaignVideoBlockCreate;
}

export interface CampaignVideoBlockCreateVariables {
  input: CampaignVideoBlockCreateInput;
  languageId?: string | null;
}
