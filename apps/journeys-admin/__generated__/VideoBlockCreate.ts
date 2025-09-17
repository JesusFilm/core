/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockCreateInput, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoBlockCreate
// ====================================================

export interface VideoBlockCreate_videoBlockCreate_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface VideoBlockCreate_videoBlockCreate_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface VideoBlockCreate_videoBlockCreate_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface VideoBlockCreate_videoBlockCreate_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface VideoBlockCreate_videoBlockCreate_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: VideoBlockCreate_videoBlockCreate_mediaVideo_Video_variantLanguages_name[];
}

export interface VideoBlockCreate_videoBlockCreate_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: VideoBlockCreate_videoBlockCreate_mediaVideo_Video_title[];
  images: VideoBlockCreate_videoBlockCreate_mediaVideo_Video_images[];
  variant: VideoBlockCreate_videoBlockCreate_mediaVideo_Video_variant | null;
  variantLanguages: VideoBlockCreate_videoBlockCreate_mediaVideo_Video_variantLanguages[];
}

export interface VideoBlockCreate_videoBlockCreate_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface VideoBlockCreate_videoBlockCreate_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type VideoBlockCreate_videoBlockCreate_mediaVideo = VideoBlockCreate_videoBlockCreate_mediaVideo_Video | VideoBlockCreate_videoBlockCreate_mediaVideo_MuxVideo | VideoBlockCreate_videoBlockCreate_mediaVideo_YouTube;

export interface VideoBlockCreate_videoBlockCreate_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface VideoBlockCreate_videoBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface VideoBlockCreate_videoBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface VideoBlockCreate_videoBlockCreate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type VideoBlockCreate_videoBlockCreate_action = VideoBlockCreate_videoBlockCreate_action_PhoneAction | VideoBlockCreate_videoBlockCreate_action_NavigateToBlockAction | VideoBlockCreate_videoBlockCreate_action_LinkAction | VideoBlockCreate_videoBlockCreate_action_EmailAction;

export interface VideoBlockCreate_videoBlockCreate {
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
  mediaVideo: VideoBlockCreate_videoBlockCreate_mediaVideo | null;
  action: VideoBlockCreate_videoBlockCreate_action | null;
}

export interface VideoBlockCreate {
  videoBlockCreate: VideoBlockCreate_videoBlockCreate;
}

export interface VideoBlockCreateVariables {
  input: VideoBlockCreateInput;
}
