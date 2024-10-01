/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardVideoRestore
// ====================================================

export interface CardVideoRestore_video_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface CardVideoRestore_video_VideoBlock_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CardVideoRestore_video_VideoBlock_video_images {
  __typename: "CloudflareImage";
  id: string;
}

export interface CardVideoRestore_video_VideoBlock_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardVideoRestore_video_VideoBlock_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CardVideoRestore_video_VideoBlock_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CardVideoRestore_video_VideoBlock_video_variantLanguages_name[];
}

export interface CardVideoRestore_video_VideoBlock_video {
  __typename: "Video";
  id: string;
  title: CardVideoRestore_video_VideoBlock_video_title[];
  images: CardVideoRestore_video_VideoBlock_video_images[];
  variant: CardVideoRestore_video_VideoBlock_video_variant | null;
  variantLanguages: CardVideoRestore_video_VideoBlock_video_variantLanguages[];
}

export interface CardVideoRestore_video_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardVideoRestore_video_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardVideoRestore_video_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardVideoRestore_video_VideoBlock_action = CardVideoRestore_video_VideoBlock_action_NavigateToBlockAction | CardVideoRestore_video_VideoBlock_action_LinkAction | CardVideoRestore_video_VideoBlock_action_EmailAction;

export interface CardVideoRestore_video_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  fullsize: boolean | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoId: string | null;
  /**
   * internal source videos: videoId and videoVariantLanguageId both need to be set
   * to select a video.
   * For other sources only videoId needs to be set.
   */
  videoVariantLanguageId: string | null;
  /**
   * internal source: videoId, videoVariantLanguageId, and video present
   * youTube source: videoId, title, description, and duration present
   */
  source: VideoBlockSource;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field.
   * For other sources this is automatically populated.
   */
  title: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  description: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   * duration in seconds.
   */
  duration: number | null;
  /**
   * how the video should display within the VideoBlock
   */
  objectFit: VideoBlockObjectFit | null;
  /**
   * internal source videos: video is only populated when videoID and
   * videoVariantLanguageId are present
   */
  video: CardVideoRestore_video_VideoBlock_video | null;
  /**
   * action that should be performed when the video ends
   */
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
