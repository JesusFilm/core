/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoBlockUpdate
// ====================================================

export interface VideoBlockUpdate_videoBlockUpdate_video_variant {
  __typename: "VideoVariant";
  hls: string;
}

export interface VideoBlockUpdate_videoBlockUpdate_video {
  __typename: "Video";
  variant: VideoBlockUpdate_videoBlockUpdate_video_variant | null;
}

export interface VideoBlockUpdate_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  muted: boolean | null;
  autoplay: boolean | null;
  video: VideoBlockUpdate_videoBlockUpdate_video | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
}

export interface VideoBlockUpdate {
  videoBlockUpdate: VideoBlockUpdate_videoBlockUpdate;
}

export interface VideoBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: VideoBlockUpdateInput;
}
