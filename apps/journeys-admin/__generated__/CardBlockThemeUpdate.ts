/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput, ThemeMode } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockThemeUpdate
// ====================================================

export interface CardBlockThemeUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
}

export interface CardBlockThemeUpdate {
  cardBlockUpdate: CardBlockThemeUpdate_cardBlockUpdate;
}

export interface CardBlockThemeUpdateVariables {
  id: string;
  journeyId: string;
  input: CardBlockUpdateInput;
}
