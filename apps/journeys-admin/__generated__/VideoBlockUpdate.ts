/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoBlockUpdate
// ====================================================

export interface VideoBlockUpdate_videoBlockUpdate_video_title {
  __typename: "VideoTitle";
  value: string;
}

export interface VideoBlockUpdate_videoBlockUpdate_video_images {
  __typename: "CloudflareImage";
  url: string | null;
}

export interface VideoBlockUpdate_videoBlockUpdate_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface VideoBlockUpdate_videoBlockUpdate_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface VideoBlockUpdate_videoBlockUpdate_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: VideoBlockUpdate_videoBlockUpdate_video_variantLanguages_name[];
}

export interface VideoBlockUpdate_videoBlockUpdate_video {
  __typename: "Video";
  id: string;
  title: VideoBlockUpdate_videoBlockUpdate_video_title[];
  images: VideoBlockUpdate_videoBlockUpdate_video_images[];
  variant: VideoBlockUpdate_videoBlockUpdate_video_variant | null;
  variantLanguages: VideoBlockUpdate_videoBlockUpdate_video_variantLanguages[];
}

export interface VideoBlockUpdate_videoBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface VideoBlockUpdate_videoBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface VideoBlockUpdate_videoBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type VideoBlockUpdate_videoBlockUpdate_action = VideoBlockUpdate_videoBlockUpdate_action_NavigateToBlockAction | VideoBlockUpdate_videoBlockUpdate_action_LinkAction | VideoBlockUpdate_videoBlockUpdate_action_EmailAction;

export interface VideoBlockUpdate_videoBlockUpdate {
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
  video: VideoBlockUpdate_videoBlockUpdate_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: VideoBlockUpdate_videoBlockUpdate_action | null;
}

export interface VideoBlockUpdate {
  videoBlockUpdate: VideoBlockUpdate_videoBlockUpdate;
}

export interface VideoBlockUpdateVariables {
  id: string;
  input: VideoBlockUpdateInput;
}
