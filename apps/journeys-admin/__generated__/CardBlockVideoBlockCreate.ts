/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockVideoBlockCreate
// ====================================================

export interface CardBlockVideoBlockCreate_videoBlockCreate_video_title {
  __typename: "Translation";
  value: string;
}

export interface CardBlockVideoBlockCreate_videoBlockCreate_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string | null;
}

export interface CardBlockVideoBlockCreate_videoBlockCreate_video {
  __typename: "Video";
  id: string;
  title: CardBlockVideoBlockCreate_videoBlockCreate_video_title[];
  image: string | null;
  variant: CardBlockVideoBlockCreate_videoBlockCreate_video_variant | null;
}

export interface CardBlockVideoBlockCreate_videoBlockCreate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardBlockVideoBlockCreate_videoBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardBlockVideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface CardBlockVideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardBlockVideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction_journey | null;
}

export interface CardBlockVideoBlockCreate_videoBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type CardBlockVideoBlockCreate_videoBlockCreate_action = CardBlockVideoBlockCreate_videoBlockCreate_action_NavigateAction | CardBlockVideoBlockCreate_videoBlockCreate_action_NavigateToBlockAction | CardBlockVideoBlockCreate_videoBlockCreate_action_NavigateToJourneyAction | CardBlockVideoBlockCreate_videoBlockCreate_action_LinkAction;

export interface CardBlockVideoBlockCreate_videoBlockCreate {
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
   * videoId and videoVariantLanguageId both need to be set to select a video.
   * Relates to videos from the Jesus Film Project video library.
   */
  videoId: string | null;
  /**
   * videoId and videoVariantLanguageId both need to be set to select a video
   * Relates to videos from the Jesus Film Project video library.
   */
  videoVariantLanguageId: string | null;
  /**
   * videoUrl is used when embedding a video from a third-party provider.
   * e.g YouTube, Vimeo etc.
   */
  videoUrl: string | null;
  /**
   * video is only populated when videoID and videoVariant LanguageId are present.
   * Relates to videos from the Jesus Film Project video library.
   */
  video: CardBlockVideoBlockCreate_videoBlockCreate_video | null;
  /**
   * action that should be performed when the video ends
   */
  action: CardBlockVideoBlockCreate_videoBlockCreate_action | null;
}

export interface CardBlockVideoBlockCreate {
  videoBlockCreate: CardBlockVideoBlockCreate_videoBlockCreate;
}

export interface CardBlockVideoBlockCreateVariables {
  input: VideoBlockCreateInput;
}
