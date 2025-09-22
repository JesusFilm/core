/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput, TypographyBlockCreateInput, TextResponseBlockCreateInput, ButtonBlockCreateInput, ButtonBlockUpdateInput, IconBlockCreateInput, CardBlockUpdateInput, TypographyAlign, TypographyColor, TypographyVariant, TextResponseType, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, IconName, IconSize, IconColor, ThemeMode, ThemeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardFormCreate
// ====================================================

export interface CardFormCreate_image {
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
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
}

export interface CardFormCreate_subtitle_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormCreate_subtitle {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormCreate_subtitle_settings | null;
}

export interface CardFormCreate_title_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormCreate_title {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormCreate_title_settings | null;
}

export interface CardFormCreate_textResponse {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
  hideLabel: boolean | null;
}

export interface CardFormCreate_button_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormCreate_button_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormCreate_button_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardFormCreate_button_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardFormCreate_button_action = CardFormCreate_button_action_PhoneAction | CardFormCreate_button_action_NavigateToBlockAction | CardFormCreate_button_action_LinkAction | CardFormCreate_button_action_EmailAction;

export interface CardFormCreate_button_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormCreate_button {
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
  submitEnabled: boolean | null;
  action: CardFormCreate_button_action | null;
  settings: CardFormCreate_button_settings | null;
}

export interface CardFormCreate_startIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormCreate_endIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormCreate_buttonUpdate_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormCreate_buttonUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormCreate_buttonUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface CardFormCreate_buttonUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type CardFormCreate_buttonUpdate_action = CardFormCreate_buttonUpdate_action_PhoneAction | CardFormCreate_buttonUpdate_action_NavigateToBlockAction | CardFormCreate_buttonUpdate_action_LinkAction | CardFormCreate_buttonUpdate_action_EmailAction;

export interface CardFormCreate_buttonUpdate_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardFormCreate_buttonUpdate {
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
  submitEnabled: boolean | null;
  action: CardFormCreate_buttonUpdate_action | null;
  settings: CardFormCreate_buttonUpdate_settings | null;
}

export interface CardFormCreate_body_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardFormCreate_body {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardFormCreate_body_settings | null;
}

export interface CardFormCreate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * backdropBlur should be a number representing blur amount in pixels e.g 20.
   */
  backdropBlur: number | null;
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

export interface CardFormCreate {
  image: CardFormCreate_image;
  subtitle: CardFormCreate_subtitle;
  title: CardFormCreate_title;
  textResponse: CardFormCreate_textResponse;
  button: CardFormCreate_button;
  startIcon: CardFormCreate_startIcon;
  endIcon: CardFormCreate_endIcon;
  buttonUpdate: CardFormCreate_buttonUpdate | null;
  body: CardFormCreate_body;
  cardBlockUpdate: CardFormCreate_cardBlockUpdate;
}

export interface CardFormCreateVariables {
  imageInput: ImageBlockCreateInput;
  subtitleInput: TypographyBlockCreateInput;
  titleInput: TypographyBlockCreateInput;
  textResponseInput: TextResponseBlockCreateInput;
  buttonInput: ButtonBlockCreateInput;
  buttonId: string;
  buttonUpdateInput: ButtonBlockUpdateInput;
  startIconInput: IconBlockCreateInput;
  endIconInput: IconBlockCreateInput;
  bodyInput: TypographyBlockCreateInput;
  journeyId: string;
  cardId: string;
  cardInput: CardBlockUpdateInput;
}
