/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockBgColorUpdate
// ====================================================

export interface CardBlockBgColorUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
}

export interface CardBlockBgColorUpdate {
  cardBlockUpdate: CardBlockBgColorUpdate_cardBlockUpdate;
}

export interface CardBlockBgColorUpdateVariables {
  id: string;
  journeyId: string;
  input: CardBlockUpdateInput;
}
