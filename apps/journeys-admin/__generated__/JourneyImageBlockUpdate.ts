/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyImageBlockUpdate
// ====================================================

export interface JourneyImageBlockUpdate_imageBlockUpdate {
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

export interface JourneyImageBlockUpdate {
  imageBlockUpdate: JourneyImageBlockUpdate_imageBlockUpdate;
}

export interface JourneyImageBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: ImageBlockUpdateInput;
}
