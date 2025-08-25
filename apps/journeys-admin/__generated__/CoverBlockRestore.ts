/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CoverBlockRestore
// ====================================================

export interface CoverBlockRestore_blockRestore_StepBlock {
  __typename: "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_variantLanguages_name[];
}

export interface CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video {
  __typename: "Video";
  id: string;
  title: CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_title[];
  images: CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_images[];
  variant: CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_variant | null;
  variantLanguages: CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video_variantLanguages[];
}

export interface CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_MuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
}

export interface CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_YouTube {
  __typename: "YouTube";
  id: string;
}

export type CoverBlockRestore_blockRestore_VideoBlock_mediaVideo = CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_Video | CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_MuxVideo | CoverBlockRestore_blockRestore_VideoBlock_mediaVideo_YouTube;

export interface CoverBlockRestore_blockRestore_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CoverBlockRestore_blockRestore_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CoverBlockRestore_blockRestore_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface CoverBlockRestore_blockRestore_VideoBlock_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
}

export type CoverBlockRestore_blockRestore_VideoBlock_action = CoverBlockRestore_blockRestore_VideoBlock_action_NavigateToBlockAction | CoverBlockRestore_blockRestore_VideoBlock_action_LinkAction | CoverBlockRestore_blockRestore_VideoBlock_action_EmailAction | CoverBlockRestore_blockRestore_VideoBlock_action_PhoneAction;

export interface CoverBlockRestore_blockRestore_VideoBlock {
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
  mediaVideo: CoverBlockRestore_blockRestore_VideoBlock_mediaVideo | null;
  /**
   * action that should be performed when the video ends
   */
  action: CoverBlockRestore_blockRestore_VideoBlock_action | null;
}

export interface CoverBlockRestore_blockRestore_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export type CoverBlockRestore_blockRestore = CoverBlockRestore_blockRestore_StepBlock | CoverBlockRestore_blockRestore_VideoBlock | CoverBlockRestore_blockRestore_ImageBlock;

export interface CoverBlockRestore_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
}

export interface CoverBlockRestore {
  /**
   * blockRestore is used for redo/undo
   */
  blockRestore: CoverBlockRestore_blockRestore[];
  cardBlockUpdate: CoverBlockRestore_cardBlockUpdate;
}

export interface CoverBlockRestoreVariables {
  id: string;
  cardBlockId: string;
}
