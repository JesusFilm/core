/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockBackgroundColorUpdate
// ====================================================

export interface CardBlockBackgroundColorUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
}

export interface CardBlockBackgroundColorUpdate {
  cardBlockUpdate: CardBlockBackgroundColorUpdate_cardBlockUpdate;
}

export interface CardBlockBackgroundColorUpdateVariables {
  id: string;
  input: CardBlockUpdateInput;
}
