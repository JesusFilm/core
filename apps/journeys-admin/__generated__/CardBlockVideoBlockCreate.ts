/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockVideoBlockCreate
// ====================================================

export interface CardBlockVideoBlockCreate_videoBlockCreate_video_variant {
  __typename: "VideoVariant";
  id: string;
  hls: string;
}

export interface CardBlockVideoBlockCreate_videoBlockCreate_video {
  __typename: "Video";
  id: string;
  variant: CardBlockVideoBlockCreate_videoBlockCreate_video_variant | null;
}

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
   * videoId and videoVariantLanguageId both need to be set to select a video
   */
  videoId: string | null;
  /**
   * videoId and videoVariantLanguageId both need to be set to select a video
   */
  videoVariantLanguageId: string | null;
  video: CardBlockVideoBlockCreate_videoBlockCreate_video | null;
}

export interface CardBlockVideoBlockCreate {
  videoBlockCreate: CardBlockVideoBlockCreate_videoBlockCreate;
}

export interface CardBlockVideoBlockCreateVariables {
  input: VideoBlockCreateInput;
}
