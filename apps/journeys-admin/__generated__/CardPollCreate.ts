/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput, TypographyBlockCreateInput, RadioQuestionBlockCreateInput, RadioOptionBlockCreateInput, CardBlockUpdateInput, TypographyAlign, TypographyColor, TypographyVariant, ThemeMode, ThemeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardPollCreate
// ====================================================

export interface CardPollCreate_image {
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

export interface CardPollCreate_subtitle_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollCreate_subtitle {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollCreate_subtitle_settings | null;
}

export interface CardPollCreate_title_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollCreate_title {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollCreate_title_settings | null;
}

export interface CardPollCreate_radioQuestion {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface CardPollCreate_radioOption1_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollCreate_radioOption1_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardPollCreate_radioOption1_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface CardPollCreate_radioOption1_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type CardPollCreate_radioOption1_action = CardPollCreate_radioOption1_action_NavigateToBlockAction | CardPollCreate_radioOption1_action_LinkAction | CardPollCreate_radioOption1_action_EmailAction | CardPollCreate_radioOption1_action_PhoneAction;

export interface CardPollCreate_radioOption1 {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollCreate_radioOption1_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollCreate_radioOption2_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollCreate_radioOption2_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardPollCreate_radioOption2_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface CardPollCreate_radioOption2_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type CardPollCreate_radioOption2_action = CardPollCreate_radioOption2_action_NavigateToBlockAction | CardPollCreate_radioOption2_action_LinkAction | CardPollCreate_radioOption2_action_EmailAction | CardPollCreate_radioOption2_action_PhoneAction;

export interface CardPollCreate_radioOption2 {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollCreate_radioOption2_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollCreate_radioOption3_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollCreate_radioOption3_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardPollCreate_radioOption3_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface CardPollCreate_radioOption3_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type CardPollCreate_radioOption3_action = CardPollCreate_radioOption3_action_NavigateToBlockAction | CardPollCreate_radioOption3_action_LinkAction | CardPollCreate_radioOption3_action_EmailAction | CardPollCreate_radioOption3_action_PhoneAction;

export interface CardPollCreate_radioOption3 {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollCreate_radioOption3_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollCreate_radioOption4_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardPollCreate_radioOption4_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardPollCreate_radioOption4_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface CardPollCreate_radioOption4_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type CardPollCreate_radioOption4_action = CardPollCreate_radioOption4_action_NavigateToBlockAction | CardPollCreate_radioOption4_action_LinkAction | CardPollCreate_radioOption4_action_EmailAction | CardPollCreate_radioOption4_action_PhoneAction;

export interface CardPollCreate_radioOption4 {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: CardPollCreate_radioOption4_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}

export interface CardPollCreate_body_settings {
  __typename: "TypographyBlockSettings";
  /**
   * Color of the typography
   */
  color: string | null;
}

export interface CardPollCreate_body {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: CardPollCreate_body_settings | null;
}

export interface CardPollCreate_cardBlockUpdate {
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

export interface CardPollCreate {
  image: CardPollCreate_image;
  subtitle: CardPollCreate_subtitle;
  title: CardPollCreate_title;
  radioQuestion: CardPollCreate_radioQuestion;
  radioOption1: CardPollCreate_radioOption1;
  radioOption2: CardPollCreate_radioOption2;
  radioOption3: CardPollCreate_radioOption3;
  radioOption4: CardPollCreate_radioOption4;
  body: CardPollCreate_body;
  cardBlockUpdate: CardPollCreate_cardBlockUpdate;
}

export interface CardPollCreateVariables {
  imageInput: ImageBlockCreateInput;
  subtitleInput: TypographyBlockCreateInput;
  titleInput: TypographyBlockCreateInput;
  radioQuestionInput: RadioQuestionBlockCreateInput;
  radioOptionInput1: RadioOptionBlockCreateInput;
  radioOptionInput2: RadioOptionBlockCreateInput;
  radioOptionInput3: RadioOptionBlockCreateInput;
  radioOptionInput4: RadioOptionBlockCreateInput;
  bodyInput: TypographyBlockCreateInput;
  journeyId: string;
  cardId: string;
  cardInput: CardBlockUpdateInput;
}
