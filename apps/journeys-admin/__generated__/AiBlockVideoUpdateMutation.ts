/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockVideoUpdateMutation
// ====================================================

export interface AiBlockVideoUpdateMutation_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
}

export interface AiBlockVideoUpdateMutation {
  videoBlockUpdate: AiBlockVideoUpdateMutation_videoBlockUpdate;
}

export interface AiBlockVideoUpdateMutationVariables {
  id: string;
  input: VideoBlockUpdateInput;
}
