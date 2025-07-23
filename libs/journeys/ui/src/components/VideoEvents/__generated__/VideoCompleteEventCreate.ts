/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoCompleteEventCreateInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: VideoCompleteEventCreate
// ====================================================

export interface VideoCompleteEventCreate_videoCompleteEventCreate {
  __typename: "VideoCompleteEvent";
  id: string | null;
}

export interface VideoCompleteEventCreate {
  videoCompleteEventCreate: VideoCompleteEventCreate_videoCompleteEventCreate | null;
}

export interface VideoCompleteEventCreateVariables {
  input: VideoCompleteEventCreateInput;
}
