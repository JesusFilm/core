/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockCreateInput, ButtonBlockCreateInput, IconBlockCreateInput, ButtonBlockUpdateInput, CardBlockUpdateInput, TextResponseType, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor, ThemeMode, ThemeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseWithButtonCreate
// ====================================================

export interface TextResponseWithButtonCreate_textResponse {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export interface TextResponseWithButtonCreate_button_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonCreate_button_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface TextResponseWithButtonCreate_button_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type TextResponseWithButtonCreate_button_action = TextResponseWithButtonCreate_button_action_NavigateToBlockAction | TextResponseWithButtonCreate_button_action_LinkAction | TextResponseWithButtonCreate_button_action_EmailAction;

export interface TextResponseWithButtonCreate_button {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  action: TextResponseWithButtonCreate_button_action | null;
  submitEnabled: boolean | null;
}

export interface TextResponseWithButtonCreate_startIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseWithButtonCreate_endIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseWithButtonCreate_buttonUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonCreate_buttonUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface TextResponseWithButtonCreate_buttonUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type TextResponseWithButtonCreate_buttonUpdate_action = TextResponseWithButtonCreate_buttonUpdate_action_NavigateToBlockAction | TextResponseWithButtonCreate_buttonUpdate_action_LinkAction | TextResponseWithButtonCreate_buttonUpdate_action_EmailAction;

export interface TextResponseWithButtonCreate_buttonUpdate {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  action: TextResponseWithButtonCreate_buttonUpdate_action | null;
  submitEnabled: boolean | null;
}

export interface TextResponseWithButtonCreate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
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
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface TextResponseWithButtonCreate {
  textResponse: TextResponseWithButtonCreate_textResponse;
  button: TextResponseWithButtonCreate_button;
  startIcon: TextResponseWithButtonCreate_startIcon;
  endIcon: TextResponseWithButtonCreate_endIcon;
  buttonUpdate: TextResponseWithButtonCreate_buttonUpdate | null;
  cardBlockUpdate: TextResponseWithButtonCreate_cardBlockUpdate;
}

export interface TextResponseWithButtonCreateVariables {
  textResponseInput: TextResponseBlockCreateInput;
  buttonInput: ButtonBlockCreateInput;
  iconInput1: IconBlockCreateInput;
  iconInput2: IconBlockCreateInput;
  buttonId: string;
  journeyId: string;
  buttonUpdateInput: ButtonBlockUpdateInput;
  cardId: string;
  cardInput: CardBlockUpdateInput;
}
