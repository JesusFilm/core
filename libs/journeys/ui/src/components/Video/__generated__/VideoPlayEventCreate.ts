/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoPlayEventCreateInput, VideoPlayEventStateEnum } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: VideoPlayEventCreate
// ====================================================

export interface VideoPlayEventCreate_videoPlayEventCreate {
  __typename: "VideoPlayEvent";
  state: VideoPlayEventStateEnum | null;
  position: number | null;
}

export interface VideoPlayEventCreate {
  videoPlayEventCreate: VideoPlayEventCreate_videoPlayEventCreate;
}

export interface VideoPlayEventCreateVariables {
  input: VideoPlayEventCreateInput;
}
