/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoExpandEventCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoExpandEventCreate
// ====================================================

export interface VideoExpandEventCreate_videoExpandEventCreate {
  __typename: "VideoExpandEvent";
  id: string | null;
}

export interface VideoExpandEventCreate {
  videoExpandEventCreate: VideoExpandEventCreate_videoExpandEventCreate | null;
}

export interface VideoExpandEventCreateVariables {
  input: VideoExpandEventCreateInput;
}
