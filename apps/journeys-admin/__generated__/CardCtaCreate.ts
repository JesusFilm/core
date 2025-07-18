/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput, TypographyBlockCreateInput, ButtonBlockCreateInput, ButtonBlockUpdateInput, IconBlockCreateInput, CardBlockUpdateInput, TypographyAlign, TypographyColor, TypographyVariant, ButtonVariant, ButtonColor, ButtonSize, ButtonAlignment, IconName, IconSize, IconColor, ThemeMode, ThemeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardCtaCreate
// ====================================================

export interface CardCtaCreate_image {
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

export interface CardCtaCreate_subtitle_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaCreate_subtitle {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaCreate_subtitle_settings | null;
}

export interface CardCtaCreate_title_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardCtaCreate_title {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardCtaCreate_title_settings | null;
}

export interface CardCtaCreate_button1_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button1_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button1_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button1_action = CardCtaCreate_button1_action_NavigateToBlockAction | CardCtaCreate_button1_action_LinkAction | CardCtaCreate_button1_action_EmailAction;

export interface CardCtaCreate_button1_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaCreate_button1 {
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
  action: CardCtaCreate_button1_action | null;
  settings: CardCtaCreate_button1_settings | null;
}

export interface CardCtaCreate_startIcon1 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_endIcon1 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_button1Update_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button1Update_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button1Update_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button1Update_action = CardCtaCreate_button1Update_action_NavigateToBlockAction | CardCtaCreate_button1Update_action_LinkAction | CardCtaCreate_button1Update_action_EmailAction;

export interface CardCtaCreate_button1Update_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaCreate_button1Update {
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
  action: CardCtaCreate_button1Update_action | null;
  settings: CardCtaCreate_button1Update_settings | null;
}

export interface CardCtaCreate_button2_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button2_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button2_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button2_action = CardCtaCreate_button2_action_NavigateToBlockAction | CardCtaCreate_button2_action_LinkAction | CardCtaCreate_button2_action_EmailAction;

export interface CardCtaCreate_button2_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaCreate_button2 {
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
  action: CardCtaCreate_button2_action | null;
  settings: CardCtaCreate_button2_settings | null;
}

export interface CardCtaCreate_startIcon2 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_endIcon2 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_button2Update_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button2Update_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button2Update_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button2Update_action = CardCtaCreate_button2Update_action_NavigateToBlockAction | CardCtaCreate_button2Update_action_LinkAction | CardCtaCreate_button2Update_action_EmailAction;

export interface CardCtaCreate_button2Update_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaCreate_button2Update {
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
  action: CardCtaCreate_button2Update_action | null;
  settings: CardCtaCreate_button2Update_settings | null;
}

export interface CardCtaCreate_button3_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button3_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button3_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button3_action = CardCtaCreate_button3_action_NavigateToBlockAction | CardCtaCreate_button3_action_LinkAction | CardCtaCreate_button3_action_EmailAction;

export interface CardCtaCreate_button3_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaCreate_button3 {
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
  action: CardCtaCreate_button3_action | null;
  settings: CardCtaCreate_button3_settings | null;
}

export interface CardCtaCreate_startIcon3 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_endIcon3 {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardCtaCreate_button3Update_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardCtaCreate_button3Update_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardCtaCreate_button3Update_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardCtaCreate_button3Update_action = CardCtaCreate_button3Update_action_NavigateToBlockAction | CardCtaCreate_button3Update_action_LinkAction | CardCtaCreate_button3Update_action_EmailAction;

export interface CardCtaCreate_button3Update_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Alignment of the button
   */
  alignment: ButtonAlignment | null;
}

export interface CardCtaCreate_button3Update {
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
  action: CardCtaCreate_button3Update_action | null;
  settings: CardCtaCreate_button3Update_settings | null;
}

export interface CardCtaCreate_cardBlockUpdate {
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

export interface CardCtaCreate {
  image: CardCtaCreate_image;
  subtitle: CardCtaCreate_subtitle;
  title: CardCtaCreate_title;
  button1: CardCtaCreate_button1;
  startIcon1: CardCtaCreate_startIcon1;
  endIcon1: CardCtaCreate_endIcon1;
  button1Update: CardCtaCreate_button1Update | null;
  button2: CardCtaCreate_button2;
  startIcon2: CardCtaCreate_startIcon2;
  endIcon2: CardCtaCreate_endIcon2;
  button2Update: CardCtaCreate_button2Update | null;
  button3: CardCtaCreate_button3;
  startIcon3: CardCtaCreate_startIcon3;
  endIcon3: CardCtaCreate_endIcon3;
  button3Update: CardCtaCreate_button3Update | null;
  cardBlockUpdate: CardCtaCreate_cardBlockUpdate;
}

export interface CardCtaCreateVariables {
  journeyId: string;
  imageInput: ImageBlockCreateInput;
  subtitleInput: TypographyBlockCreateInput;
  titleInput: TypographyBlockCreateInput;
  button1Input: ButtonBlockCreateInput;
  button1Id: string;
  button1UpdateInput: ButtonBlockUpdateInput;
  startIcon1Input: IconBlockCreateInput;
  endIcon1Input: IconBlockCreateInput;
  button2Input: ButtonBlockCreateInput;
  button2Id: string;
  button2UpdateInput: ButtonBlockUpdateInput;
  startIcon2Input: IconBlockCreateInput;
  endIcon2Input: IconBlockCreateInput;
  button3Input: ButtonBlockCreateInput;
  button3Id: string;
  button3UpdateInput: ButtonBlockUpdateInput;
  startIcon3Input: IconBlockCreateInput;
  endIcon3Input: IconBlockCreateInput;
  cardId: string;
  cardInput: CardBlockUpdateInput;
}
