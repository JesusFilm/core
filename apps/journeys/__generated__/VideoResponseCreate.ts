/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoResponseCreateInput, VideoResponseStateEnum } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoResponseCreate
// ====================================================

export interface VideoResponseCreate_videoResponseCreate {
  __typename: "VideoResponse";
  id: string;
  state: VideoResponseStateEnum;
  position: number;
}

export interface VideoResponseCreate {
  videoResponseCreate: VideoResponseCreate_videoResponseCreate;
}

export interface VideoResponseCreateVariables {
  input: VideoResponseCreateInput;
}
