/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ImageBlockUpdate
// ====================================================

export interface ImageBlockUpdate_imageBlockUpdate {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  parentOrder: number | null;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export interface ImageBlockUpdate {
  imageBlockUpdate: ImageBlockUpdate_imageBlockUpdate;
}

export interface ImageBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: ImageBlockUpdateInput;
}
