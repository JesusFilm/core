/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardVideoDelete
// ====================================================

export interface CardVideoDelete_video_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "TypographyBlock";
}

export interface CardVideoDelete_video_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardVideoDelete_video_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CardVideoDelete_video_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardVideoDelete_video_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardVideoDelete_video_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardVideoDelete_video_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CardVideoDelete_video_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CardVideoDelete_video_VideoBlock_mediaVideo_Video_title[];
  images: CardVideoDelete_video_VideoBlock_mediaVideo_Video_images[];
  variant: CardVideoDelete_video_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CardVideoDelete_video_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CardVideoDelete_video_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CardVideoDelete_video_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CardVideoDelete_video_VideoBlock_mediaVideo = CardVideoDelete_video_VideoBlock_mediaVideo_Video | CardVideoDelete_video_VideoBlock_mediaVideo_MuxVideo | CardVideoDelete_video_VideoBlock_mediaVideo_YouTube;

export interface CardVideoDelete_video_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardVideoDelete_video_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardVideoDelete_video_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardVideoDelete_video_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardVideoDelete_video_VideoBlock_action = CardVideoDelete_video_VideoBlock_action_PhoneAction | CardVideoDelete_video_VideoBlock_action_NavigateToBlockAction | CardVideoDelete_video_VideoBlock_action_LinkAction | CardVideoDelete_video_VideoBlock_action_EmailAction;

export interface CardVideoDelete_video_VideoBlock {
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
  mediaVideo: CardVideoDelete_video_VideoBlock_mediaVideo | null;
  action: CardVideoDelete_video_VideoBlock_action | null;
}

export type CardVideoDelete_video = CardVideoDelete_video_ImageBlock | CardVideoDelete_video_VideoBlock;

export interface CardVideoDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  video: CardVideoDelete_video[];
}

export interface CardVideoDeleteVariables {
  videoId: string;
}
