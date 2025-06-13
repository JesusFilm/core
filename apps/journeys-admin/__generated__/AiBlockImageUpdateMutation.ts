/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockImageUpdateMutation
// ====================================================

export interface AiBlockImageUpdateMutation_imageBlockUpdate {
  __typename: "ImageBlock";
  id: string;
}

export interface AiBlockImageUpdateMutation {
  imageBlockUpdate: AiBlockImageUpdateMutation_imageBlockUpdate;
}

export interface AiBlockImageUpdateMutationVariables {
  id: string;
  input: ImageBlockUpdateInput;
}
