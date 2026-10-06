/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignVideoCarouselBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, CampaignMediaSide, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignVideoCarouselBlockUpdateVideo
// ====================================================

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_title_language {
  __typename: "Language";
  id: string;
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_title_language;
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children_title_language {
  __typename: "Language";
  id: string;
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children_title_language;
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children {
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
  title: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children_title[];
  images: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children_images[];
  variant: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children_variant | null;
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video {
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
  title: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_title[];
  images: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_images[];
  variant: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_variant | null;
  children: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video_children[];
}

export interface CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate {
  __typename: "CampaignVideoCarouselBlock";
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
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
  eyebrow: string | null;
  title: string | null;
  /**
   * The Watch Video to expand; null for explicit children.
   */
  videoId: string | null;
  /**
   * The campaign language when the Watch Video was linked; the language the expansion resolves in.
   */
  videoVariantLanguageId: string | null;
  /**
   * Watch expansion: the federated `Video` reference (`id`, `primaryLanguageId`) the gateway joins for `children` and `childrenCount`; api-journeys never fetches or caches it. Null in explicit mode.
   */
  video: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate_video | null;
}

export interface CampaignVideoCarouselBlockUpdateVideo {
  /**
   * Update the video carousel’s default-language eyebrow or title, its Watch expansion, or its Section Background and colour overrides. Only the given fields change. The nullable `videoId` is the mode: set ⇒ the Video’s children are the cards (any label; the gateway joins them through `video`), null ⇒ the explicit CampaignVideoBlock children are.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.
   * - BAD_USER_INPUT (field: `url`): "That link isn't a Watch video", or given together with `videoId`.
   * - BAD_USER_INPUT (field: `videoId`): not a published Watch video.
   * - BAD_USER_INPUT (field: `videoVariantLanguageId`): given without `url` or `videoId`.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock of this campaign.
   */
  campaignVideoCarouselBlockUpdate: CampaignVideoCarouselBlockUpdateVideo_campaignVideoCarouselBlockUpdate;
}

export interface CampaignVideoCarouselBlockUpdateVideoVariables {
  id: string;
  input: CampaignVideoCarouselBlockUpdateInput;
  languageId?: string | null;
}
