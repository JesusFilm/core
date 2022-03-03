/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockImageBlockUpdate
// ====================================================

export interface CardBlockImageBlockUpdate_imageBlockUpdate {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface CardBlockImageBlockUpdate {
  imageBlockUpdate: CardBlockImageBlockUpdate_imageBlockUpdate;
}

export interface CardBlockImageBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: ImageBlockUpdateInput;
}
