/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoPlayEventCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoPlayEventCreate
// ====================================================

export interface VideoPlayEventCreate_videoPlayEventCreate {
  __typename: "VideoPlayEvent";
  id: string;
}

export interface VideoPlayEventCreate {
  videoPlayEventCreate: VideoPlayEventCreate_videoPlayEventCreate;
}

export interface VideoPlayEventCreateVariables {
  input: VideoPlayEventCreateInput;
}
