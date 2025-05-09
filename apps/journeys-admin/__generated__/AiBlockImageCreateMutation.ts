/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockImageCreateMutation
// ====================================================

export interface AiBlockImageCreateMutation_imageBlockCreate {
  __typename: "ImageBlock";
  id: string;
}

export interface AiBlockImageCreateMutation {
  imageBlockCreate: AiBlockImageCreateMutation_imageBlockCreate;
}

export interface AiBlockImageCreateMutationVariables {
  input: ImageBlockCreateInput;
}
