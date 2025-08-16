/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoCompleteEventCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoCompleteEventCreate
// ====================================================

export interface VideoCompleteEventCreate_videoCompleteEventCreate {
  __typename: "VideoCompleteEvent";
  id: string;
}

export interface VideoCompleteEventCreate {
  videoCompleteEventCreate: VideoCompleteEventCreate_videoCompleteEventCreate;
}

export interface VideoCompleteEventCreateVariables {
  input: VideoCompleteEventCreateInput;
}
