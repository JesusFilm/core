/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MediaScreenImageBlockUpdate
// ====================================================

export interface MediaScreenImageBlockUpdate_imageBlockUpdate {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  width: number;
  height: number;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface MediaScreenImageBlockUpdate {
  imageBlockUpdate: MediaScreenImageBlockUpdate_imageBlockUpdate;
}

export interface MediaScreenImageBlockUpdateVariables {
  id: string;
  input: ImageBlockUpdateInput;
}
