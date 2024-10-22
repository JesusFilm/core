/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ImageBlockCreate
// ====================================================

export interface ImageBlockCreate_imageBlockCreate {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface ImageBlockCreate {
  imageBlockCreate: ImageBlockCreate_imageBlockCreate;
}

export interface ImageBlockCreateVariables {
  input: ImageBlockCreateInput;
}
