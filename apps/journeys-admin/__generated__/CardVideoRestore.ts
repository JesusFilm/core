/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardVideoRestore
// ====================================================

export interface CardVideoRestore_video_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "TypographyBlock";
}

export interface CardVideoRestore_video_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardVideoRestore_video_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardVideoRestore_video_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardVideoRestore_video_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardVideoRestore_video_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardVideoRestore_video_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardVideoRestore_video_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardVideoRestore_video_VideoBlock_mediaVideo_Video_title[];
  images: CardVideoRestore_video_VideoBlock_mediaVideo_Video_images[];
  variant: CardVideoRestore_video_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardVideoRestore_video_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardVideoRestore_video_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardVideoRestore_video_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardVideoRestore_video_VideoBlock_mediaVideo = CardVideoRestore_video_VideoBlock_mediaVideo_Video | CardVideoRestore_video_VideoBlock_mediaVideo_MuxVideo | CardVideoRestore_video_VideoBlock_mediaVideo_YouTube;

export interface CardVideoRestore_video_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardVideoRestore_video_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardVideoRestore_video_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardVideoRestore_video_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardVideoRestore_video_VideoBlock_action = CardVideoRestore_video_VideoBlock_action_PhoneAction | CardVideoRestore_video_VideoBlock_action_NavigateToBlockAction | CardVideoRestore_video_VideoBlock_action_LinkAction | CardVideoRestore_video_VideoBlock_action_EmailAction;

export interface CardVideoRestore_video_VideoBlock {
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
  mediaVideo: CardVideoRestore_video_VideoBlock_mediaVideo | null;
  action: CardVideoRestore_video_VideoBlock_action | null;
}

export type CardVideoRestore_video = CardVideoRestore_video_ImageBlock | CardVideoRestore_video_VideoBlock;

export interface CardVideoRestore {
  /**
   * blockRestore is used for redo/undo
   */
  video: CardVideoRestore_video[];
}

export interface CardVideoRestoreVariables {
  videoId: string;
}
