/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockCreateInput, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CoverVideoBlockCreate
// ====================================================

export interface CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_variantLanguages_name[];
}

export interface CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_title[];
  images: CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_images[];
  variant: CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_variant | null;
  variantLanguages: CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video_variantLanguages[];
}

export interface CoverVideoBlockCreate_videoBlockCreate_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CoverVideoBlockCreate_videoBlockCreate_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CoverVideoBlockCreate_videoBlockCreate_mediaVideo = CoverVideoBlockCreate_videoBlockCreate_mediaVideo_Video | CoverVideoBlockCreate_videoBlockCreate_mediaVideo_MuxVideo | CoverVideoBlockCreate_videoBlockCreate_mediaVideo_YouTube;

export interface CoverVideoBlockCreate_videoBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface CoverVideoBlockCreate_videoBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface CoverVideoBlockCreate_videoBlockCreate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type CoverVideoBlockCreate_videoBlockCreate_action = CoverVideoBlockCreate_videoBlockCreate_action_NavigateToBlockAction | CoverVideoBlockCreate_videoBlockCreate_action_LinkAction | CoverVideoBlockCreate_videoBlockCreate_action_EmailAction;

export interface CoverVideoBlockCreate_videoBlockCreate {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean;
  autoplay: boolean;
  startAt: number | null;
  endAt: number | null;
  posterBlockId: string | null;
  fullsize: boolean;
  videoId: string | null;
  videoVariantLanguageId: string | null;
  source: VideoBlockSource | null;
  title: string;
  description: string;
  image: string | null;
  duration: number | null;
  objectFit: VideoBlockObjectFit | null;
  mediaVideo: CoverVideoBlockCreate_videoBlockCreate_mediaVideo | null;
  action: CoverVideoBlockCreate_videoBlockCreate_action | null;
}

export interface CoverVideoBlockCreate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
}

export interface CoverVideoBlockCreate {
  videoBlockCreate: CoverVideoBlockCreate_videoBlockCreate;
  cardBlockUpdate: CoverVideoBlockCreate_cardBlockUpdate;
}

export interface CoverVideoBlockCreateVariables {
  id: string;
  input: VideoBlockCreateInput;
  cardBlockId: string;
}
