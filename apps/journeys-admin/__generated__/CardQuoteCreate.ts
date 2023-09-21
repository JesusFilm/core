/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput, TypographyBlockCreateInput, TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardQuoteCreate
// ====================================================

export interface CardQuoteCreate_image {
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

export interface CardQuoteCreate_subtitle {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface CardQuoteCreate_title {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface CardQuoteCreate_body {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface CardQuoteCreate {
  image: CardQuoteCreate_image;
  subtitle: CardQuoteCreate_subtitle;
  title: CardQuoteCreate_title;
  body: CardQuoteCreate_body;
}

export interface CardQuoteCreateVariables {
  imageInput: ImageBlockCreateInput;
  subtitleInput: TypographyBlockCreateInput;
  titleInput: TypographyBlockCreateInput;
  bodyInput: TypographyBlockCreateInput;
}
