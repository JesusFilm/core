/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: VideoFields
// ====================================================

export interface VideoFields_video_title {
  __typename: "Translation";
  value: string;
}

export interface VideoFields_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface VideoFields_video {
  __typename: "Video";
  id: string;
  title: VideoFields_video_title[];
  image: string | null;
  variant: VideoFields_video_variant | null;
}

export interface VideoFields_endAction_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface VideoFields_endAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface VideoFields_endAction_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface VideoFields_endAction_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: VideoFields_endAction_NavigateToJourneyAction_journey | null;
}

export interface VideoFields_endAction_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type VideoFields_endAction = VideoFields_endAction_NavigateAction | VideoFields_endAction_NavigateToBlockAction | VideoFields_endAction_NavigateToJourneyAction | VideoFields_endAction_LinkAction;

export interface VideoFields {
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
  video: VideoFields_video | null;
  endAction: VideoFields_endAction | null;
}
