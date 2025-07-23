/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoProgressEventCreateInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: VideoProgressEventCreate
// ====================================================

export interface VideoProgressEventCreate_videoProgressEventCreate {
  __typename: "VideoProgressEvent";
  id: string | null;
}

export interface VideoProgressEventCreate {
  videoProgressEventCreate: VideoProgressEventCreate_videoProgressEventCreate | null;
}

export interface VideoProgressEventCreateVariables {
  input: VideoProgressEventCreateInput;
}
