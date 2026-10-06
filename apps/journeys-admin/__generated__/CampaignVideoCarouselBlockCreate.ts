/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignVideoCarouselBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, CampaignMediaSide, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignVideoCarouselBlockCreate
// ====================================================

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_title_language {
  __typename: "Language";
  id: string;
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_title_language;
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children_title_language {
  __typename: "Language";
  id: string;
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children_title {
  __typename: "VideoTitle";
  value: string;
  primary: boolean;
  language: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children_title_language;
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children {
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
  title: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children_title[];
  images: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children_images[];
  variant: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children_variant | null;
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video {
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
  title: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_title[];
  images: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_images[];
  variant: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_variant | null;
  children: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video_children[];
}

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate {
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
  video: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate_video | null;
}

export interface CampaignVideoCarouselBlockCreate {
  /**
   * Add a video carousel section to a page, last among its sections or at `parentOrder` with the later sections renumbered. It starts with no video and no items.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `pageId`): not a page of this campaign.
   * - BAD_USER_INPUT (field: `parentOrder`): negative.
   * - BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.
   */
  campaignVideoCarouselBlockCreate: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate;
}

export interface CampaignVideoCarouselBlockCreateVariables {
  input: CampaignVideoCarouselBlockCreateInput;
  languageId?: string | null;
}
