/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockBackgroundImageUpdate
// ====================================================

export interface CardBlockBackgroundImageUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
}

export interface CardBlockBackgroundImageUpdate {
  cardBlockUpdate: CardBlockBackgroundImageUpdate_cardBlockUpdate;
}

export interface CardBlockBackgroundImageUpdateVariables {
  id: string;
  journeyId: string;
  input: CardBlockUpdateInput;
}
