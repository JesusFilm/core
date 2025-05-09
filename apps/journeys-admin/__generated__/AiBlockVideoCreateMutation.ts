/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockVideoCreateMutation
// ====================================================

export interface AiBlockVideoCreateMutation_videoBlockCreate {
  __typename: "VideoBlock";
  id: string;
}

export interface AiBlockVideoCreateMutation {
  videoBlockCreate: AiBlockVideoCreateMutation_videoBlockCreate;
}

export interface AiBlockVideoCreateMutationVariables {
  input: VideoBlockCreateInput;
}
