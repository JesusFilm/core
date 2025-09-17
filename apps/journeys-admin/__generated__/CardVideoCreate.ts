/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockCreateInput, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardVideoCreate
// ====================================================

export interface CardVideoCreate_video_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardVideoCreate_video_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardVideoCreate_video_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardVideoCreate_video_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardVideoCreate_video_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardVideoCreate_video_mediaVideo_Video_variantLanguages_name[];
}

export interface CardVideoCreate_video_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardVideoCreate_video_mediaVideo_Video_title[];
  images: CardVideoCreate_video_mediaVideo_Video_images[];
  variant: CardVideoCreate_video_mediaVideo_Video_variant | null;
  variantLanguages: CardVideoCreate_video_mediaVideo_Video_variantLanguages[];
}

export interface CardVideoCreate_video_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardVideoCreate_video_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardVideoCreate_video_mediaVideo = CardVideoCreate_video_mediaVideo_Video | CardVideoCreate_video_mediaVideo_MuxVideo | CardVideoCreate_video_mediaVideo_YouTube;

export interface CardVideoCreate_video_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardVideoCreate_video_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardVideoCreate_video_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardVideoCreate_video_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardVideoCreate_video_action = CardVideoCreate_video_action_PhoneAction | CardVideoCreate_video_action_NavigateToBlockAction | CardVideoCreate_video_action_LinkAction | CardVideoCreate_video_action_EmailAction;

export interface CardVideoCreate_video {
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
  mediaVideo: CardVideoCreate_video_mediaVideo | null;
  action: CardVideoCreate_video_action | null;
}

export interface CardVideoCreate {
  video: CardVideoCreate_video;
}

export interface CardVideoCreateVariables {
  videoInput: VideoBlockCreateInput;
}
