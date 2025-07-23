/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput, ThemeMode, ThemeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockThemeModeUpdate
// ====================================================

export interface CardBlockThemeModeUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
}

export interface CardBlockThemeModeUpdate {
  cardBlockUpdate: CardBlockThemeModeUpdate_cardBlockUpdate;
}

export interface CardBlockThemeModeUpdateVariables {
  id: string;
  input: CardBlockUpdateInput;
}
