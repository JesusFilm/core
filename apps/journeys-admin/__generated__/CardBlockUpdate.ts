/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput, ThemeMode } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockUpdate
// ====================================================

export interface CardBlockUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
}

export interface CardBlockUpdate {
  cardBlockUpdate: CardBlockUpdate_cardBlockUpdate;
}

export interface CardBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: CardBlockUpdateInput;
}
