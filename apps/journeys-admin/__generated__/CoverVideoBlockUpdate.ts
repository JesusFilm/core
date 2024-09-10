/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CoverVideoBlockUpdate
// ====================================================

export interface CoverVideoBlockUpdate_videoBlockUpdate_video_title {
  __typename: "Translation";
  value: string;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_video_variantLanguages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: CoverVideoBlockUpdate_videoBlockUpdate_video_variantLanguages_name[];
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_video {
  __typename: "Video";
  id: string;
  title: CoverVideoBlockUpdate_videoBlockUpdate_video_title[];
  image: string | null;
  variant: CoverVideoBlockUpdate_videoBlockUpdate_video_variant | null;
  variantLanguages: CoverVideoBlockUpdate_videoBlockUpdate_video_variantLanguages[];
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CoverVideoBlockUpdate_videoBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CoverVideoBlockUpdate_videoBlockUpdate_action = CoverVideoBlockUpdate_videoBlockUpdate_action_NavigateToBlockAction | CoverVideoBlockUpdate_videoBlockUpdate_action_LinkAction | CoverVideoBlockUpdate_videoBlockUpdate_action_EmailAction;

export interface CoverVideoBlockUpdate_videoBlockUpdate {
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
  video: CoverVideoBlockUpdate_videoBlockUpdate_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CoverVideoBlockUpdate_videoBlockUpdate_action | null;
}

export interface CoverVideoBlockUpdate {
  videoBlockUpdate: CoverVideoBlockUpdate_videoBlockUpdate;
}

export interface CoverVideoBlockUpdateVariables {
  id: string;
  input: VideoBlockUpdateInput;
}
