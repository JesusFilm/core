/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoBlockPosterImageUpdate
// ====================================================

export interface VideoBlockPosterImageUpdate_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
}

export interface VideoBlockPosterImageUpdate {
  videoBlockUpdate: VideoBlockPosterImageUpdate_videoBlockUpdate;
}

export interface VideoBlockPosterImageUpdateVariables {
  id: string;
  journeyId: string;
  input: VideoBlockUpdateInput;
}
