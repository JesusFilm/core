/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, CampaignMediaSide, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignVideoCarouselBlockPlaylistImport
// ====================================================

export interface CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video_title_language {
  __typename: "Language";
  id: string;
}

export interface CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video_title_language;
}

export interface CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video {
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
  title: CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video_title[];
  images: CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video_images[];
  variant: CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video_variant | null;
}

export interface CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  playbackId: string | null;
}

export interface CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo = CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_Video | CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_MuxVideo | CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo_YouTube;

export interface CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport {
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
  mediaVideo: CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport_mediaVideo | null;
}

export interface CampaignVideoCarouselBlockPlaylistImport {
  /**
   * Import the first 12 videos of a YouTube playlist into a Video Carousel as explicit CampaignVideoBlock items, appended after its children in playlist order, in one bulk create. Each item is a `youTube` video with the title, description, poster and duration the Data API returns, captured once as for a single YouTube pick. The carousel’s `videoId` is left alone: the items show once it is null. Returns the created items.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock; the playlist is unknown to YouTube.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `url`): "That link isn't a YouTube playlist", or the playlist has no public videos.
   */
  campaignVideoCarouselBlockPlaylistImport: CampaignVideoCarouselBlockPlaylistImport_campaignVideoCarouselBlockPlaylistImport[];
}

export interface CampaignVideoCarouselBlockPlaylistImportVariables {
  id: string;
  url: string;
  languageId?: string | null;
}
