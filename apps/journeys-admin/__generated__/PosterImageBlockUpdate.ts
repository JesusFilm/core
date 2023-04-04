/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: PosterImageBlockUpdate
// ====================================================

export interface PosterImageBlockUpdate_imageBlockUpdate {
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

export interface PosterImageBlockUpdate {
  imageBlockUpdate: PosterImageBlockUpdate_imageBlockUpdate;
}

export interface PosterImageBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: ImageBlockUpdateInput;
}
