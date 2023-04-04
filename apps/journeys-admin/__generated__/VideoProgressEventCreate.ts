/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoProgressEventCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoProgressEventCreate
// ====================================================

export interface VideoProgressEventCreate_videoProgressEventCreate {
  __typename: "VideoProgressEvent";
  id: string;
}

export interface VideoProgressEventCreate {
  videoProgressEventCreate: VideoProgressEventCreate_videoProgressEventCreate;
}

export interface VideoProgressEventCreateVariables {
  input: VideoProgressEventCreateInput;
}
