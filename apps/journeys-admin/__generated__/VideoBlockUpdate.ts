/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoBlockUpdate
// ====================================================

export interface VideoBlockUpdate_videoBlockUpdate_video_title {
  __typename: "Translation";
  value: string;
}

export interface VideoBlockUpdate_videoBlockUpdate_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface VideoBlockUpdate_videoBlockUpdate_video {
  __typename: "Video";
  id: string;
  title: VideoBlockUpdate_videoBlockUpdate_video_title[];
  image: string | null;
  variant: VideoBlockUpdate_videoBlockUpdate_video_variant | null;
}

export interface VideoBlockUpdate_videoBlockUpdate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface VideoBlockUpdate_videoBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface VideoBlockUpdate_videoBlockUpdate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface VideoBlockUpdate_videoBlockUpdate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: VideoBlockUpdate_videoBlockUpdate_action_NavigateToJourneyAction_journey | null;
}

export interface VideoBlockUpdate_videoBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type VideoBlockUpdate_videoBlockUpdate_action = VideoBlockUpdate_videoBlockUpdate_action_NavigateAction | VideoBlockUpdate_videoBlockUpdate_action_NavigateToBlockAction | VideoBlockUpdate_videoBlockUpdate_action_NavigateToJourneyAction | VideoBlockUpdate_videoBlockUpdate_action_LinkAction;

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
   * videoId and videoVariantLanguageId both need to be set to select a video
   */
  videoId: string | null;
  /**
   * videoId and videoVariantLanguageId both need to be set to select a video
   */
  videoVariantLanguageId: string | null;
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
  journeyId: string;
  input: VideoBlockUpdateInput;
}
