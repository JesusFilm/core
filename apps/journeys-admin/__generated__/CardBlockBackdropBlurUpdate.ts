/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockBackdropBlurUpdate
// ====================================================

export interface CardBlockBackdropBlurUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
}

export interface CardBlockBackdropBlurUpdate {
  cardBlockUpdate: CardBlockBackdropBlurUpdate_cardBlockUpdate;
}

export interface CardBlockBackdropBlurUpdateVariables {
  id: string;
  input: CardBlockUpdateInput;
}
