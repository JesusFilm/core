/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CoverVideoBlockUpdate
// ====================================================

export interface CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_variantLanguages_name[];
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_title[];
  images: CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_images[];
  variant: CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_variant | null;
  variantLanguages: CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video_variantLanguages[];
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo = CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_Video | CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_MuxVideo | CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo_YouTube;

export interface CoverVideoBlockUpdate_videoBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
}

export type CoverVideoBlockUpdate_videoBlockUpdate_action = CoverVideoBlockUpdate_videoBlockUpdate_action_NavigateToBlockAction | CoverVideoBlockUpdate_videoBlockUpdate_action_LinkAction | CoverVideoBlockUpdate_videoBlockUpdate_action_EmailAction;

export interface CoverVideoBlockUpdate_videoBlockUpdate {
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
  mediaVideo: CoverVideoBlockUpdate_videoBlockUpdate_mediaVideo | null;
  action: CoverVideoBlockUpdate_videoBlockUpdate_action | null;
}

export interface CoverVideoBlockUpdate {
  videoBlockUpdate: CoverVideoBlockUpdate_videoBlockUpdate;
}

export interface CoverVideoBlockUpdateVariables {
  id: string;
  input: VideoBlockUpdateInput;
}
