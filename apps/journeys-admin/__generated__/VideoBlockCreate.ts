/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockCreateInput, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoBlockCreate
// ====================================================

export interface VideoBlockCreate_videoBlockCreate_video_title {
  __typename: "Translation";
  value: string;
}

export interface VideoBlockCreate_videoBlockCreate_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface VideoBlockCreate_videoBlockCreate_video {
  __typename: "Video";
  id: string;
  title: VideoBlockCreate_videoBlockCreate_video_title[];
  image: string | null;
  variant: VideoBlockCreate_videoBlockCreate_video_variant | null;
}

export interface VideoBlockCreate_videoBlockCreate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface VideoBlockCreate_videoBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface VideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface VideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: VideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction_journey_language;
}

export interface VideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: VideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction_journey | null;
}

export interface VideoBlockCreate_videoBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface VideoBlockCreate_videoBlockCreate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type VideoBlockCreate_videoBlockCreate_action = VideoBlockCreate_videoBlockCreate_action_NavigateAction | VideoBlockCreate_videoBlockCreate_action_NavigateToBlockAction | VideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction | VideoBlockCreate_videoBlockCreate_action_LinkAction | VideoBlockCreate_videoBlockCreate_action_EmailAction;

export interface VideoBlockCreate_videoBlockCreate {
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
  video: VideoBlockCreate_videoBlockCreate_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: VideoBlockCreate_videoBlockCreate_action | null;
}

export interface VideoBlockCreate {
  videoBlockCreate: VideoBlockCreate_videoBlockCreate;
}

export interface VideoBlockCreateVariables {
  input: VideoBlockCreateInput;
}
