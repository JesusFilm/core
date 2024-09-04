/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SegmindModel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateAiImage
// ====================================================

export interface CreateAiImage_createImageBySegmindPrompt {
  __typename: "CloudflareImage";
  id: string;
}

export interface CreateAiImage {
  createImageBySegmindPrompt: CreateAiImage_createImageBySegmindPrompt;
}

export interface CreateAiImageVariables {
  prompt: string;
  model: SegmindModel;
}
