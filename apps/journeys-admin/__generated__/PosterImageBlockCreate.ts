/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: PosterImageBlockCreate
// ====================================================

export interface PosterImageBlockCreate_imageBlockCreate {
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

export interface PosterImageBlockCreate_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  posterBlockId: string | null;
}

export interface PosterImageBlockCreate {
  imageBlockCreate: PosterImageBlockCreate_imageBlockCreate;
  videoBlockUpdate: PosterImageBlockCreate_videoBlockUpdate;
}

export interface PosterImageBlockCreateVariables {
  id: string;
  parentBlockId: string;
  input: ImageBlockCreateInput;
}
