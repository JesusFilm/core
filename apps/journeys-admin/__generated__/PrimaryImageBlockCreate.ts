/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: PrimaryImageBlockCreate
// ====================================================

export interface PrimaryImageBlockCreate_imageBlockCreate {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
  parentBlockId: string | null;
  width: number;
  height: number;
  parentOrder: number | null;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export interface PrimaryImageBlockCreate {
  imageBlockCreate: PrimaryImageBlockCreate_imageBlockCreate;
}

export interface PrimaryImageBlockCreateVariables {
  input: ImageBlockCreateInput;
}
