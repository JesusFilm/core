/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockVideoBlockUpdate
// ====================================================

export interface CardBlockVideoBlockUpdate_videoBlockUpdate_video_variant {
  __typename: "VideoVariant";
  hls: string;
}

export interface CardBlockVideoBlockUpdate_videoBlockUpdate_video {
  __typename: "Video";
  variant: CardBlockVideoBlockUpdate_videoBlockUpdate_video_variant | null;
}

export interface CardBlockVideoBlockUpdate_videoBlockUpdate {
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
  video: CardBlockVideoBlockUpdate_videoBlockUpdate_video | null;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
}

export interface CardBlockVideoBlockUpdate {
  videoBlockUpdate: CardBlockVideoBlockUpdate_videoBlockUpdate;
}

export interface CardBlockVideoBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: VideoBlockUpdateInput;
}
