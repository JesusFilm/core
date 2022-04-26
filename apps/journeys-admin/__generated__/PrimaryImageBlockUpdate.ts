/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: PrimaryImageBlockUpdate
// ====================================================

export interface PrimaryImageBlockUpdate_imageBlockUpdate {
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
}

export interface PrimaryImageBlockUpdate {
  imageBlockUpdate: PrimaryImageBlockUpdate_imageBlockUpdate;
}

export interface PrimaryImageBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: ImageBlockUpdateInput;
}
