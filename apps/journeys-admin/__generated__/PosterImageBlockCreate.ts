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
}

export interface PosterImageBlockCreate_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
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
