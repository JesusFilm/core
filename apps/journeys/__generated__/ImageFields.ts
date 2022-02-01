/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ImageFields
// ====================================================

export interface ImageFields {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number;
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}
