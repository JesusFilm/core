/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoStartEventCreateInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: VideoStartEventCreate
// ====================================================

export interface VideoStartEventCreate_videoStartEventCreate {
  __typename: "VideoStartEvent";
  id: string | null;
}

export interface VideoStartEventCreate {
  videoStartEventCreate: VideoStartEventCreate_videoStartEventCreate;
}

export interface VideoStartEventCreateVariables {
  input: VideoStartEventCreateInput;
}
