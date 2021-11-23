/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoResponseCreateInput, VideoResponseStateEnum } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: VideoResponseCreate
// ====================================================

export interface VideoResponseCreate_videoResponseCreate {
  __typename: "VideoResponse";
  id: string;
  state: VideoResponseStateEnum;
  position: number | null;
}

export interface VideoResponseCreate {
  videoResponseCreate: VideoResponseCreate_videoResponseCreate;
}

export interface VideoResponseCreateVariables {
  input: VideoResponseCreateInput;
}
