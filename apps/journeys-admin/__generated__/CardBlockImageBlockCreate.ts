/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockImageBlockCreate
// ====================================================

export interface CardBlockImageBlockCreate_imageBlockCreate {
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

export interface CardBlockImageBlockCreate {
  imageBlockCreate: CardBlockImageBlockCreate_imageBlockCreate;
}

export interface CardBlockImageBlockCreateVariables {
  input: ImageBlockCreateInput;
}
