/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockLayoutUpdate
// ====================================================

export interface CardBlockLayoutUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface CardBlockLayoutUpdate {
  cardBlockUpdate: CardBlockLayoutUpdate_cardBlockUpdate;
}

export interface CardBlockLayoutUpdateVariables {
  id: string;
  input: CardBlockUpdateInput;
}
