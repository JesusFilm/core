/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoBlockCreate
// ====================================================

export interface VideoBlockCreate_videoBlockCreate_video_variant {
  __typename: "VideoVariant";
  hls: string;
}

export interface VideoBlockCreate_videoBlockCreate_video {
  __typename: "Video";
  variant: VideoBlockCreate_videoBlockCreate_video_variant | null;
}

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
  video: VideoBlockCreate_videoBlockCreate_video | null;
}

export interface VideoBlockCreate {
  videoBlockCreate: VideoBlockCreate_videoBlockCreate;
}

export interface VideoBlockCreateVariables {
  input: VideoBlockCreateInput;
}
