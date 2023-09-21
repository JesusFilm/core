/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ImageBlockCreateInput, TypographyBlockCreateInput, TextResponseBlockCreateInput, IconBlockCreateInput, TextResponseBlockUpdateInput, CardBlockUpdateInput, TypographyAlign, TypographyColor, TypographyVariant, IconName, IconSize, IconColor, ThemeMode, ThemeName } from "./globalTypes";

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
}

export interface CardFormCreate_textResponse_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormCreate_textResponse_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormCreate_textResponse_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardFormCreate_textResponse_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardFormCreate_textResponse_action_NavigateToJourneyAction_journey_language;
}

export interface CardFormCreate_textResponse_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardFormCreate_textResponse_action_NavigateToJourneyAction_journey | null;
}

export interface CardFormCreate_textResponse_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormCreate_textResponse_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormCreate_textResponse_action = CardFormCreate_textResponse_action_NavigateAction | CardFormCreate_textResponse_action_NavigateToBlockAction | CardFormCreate_textResponse_action_NavigateToJourneyAction | CardFormCreate_textResponse_action_LinkAction | CardFormCreate_textResponse_action_EmailAction;

export interface CardFormCreate_textResponse {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormCreate_textResponse_action | null;
}

export interface CardFormCreate_submitIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface CardFormCreate_textResponseBlockUpdate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface CardFormCreate_textResponseBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface CardFormCreate_textResponseBlockUpdate_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface CardFormCreate_textResponseBlockUpdate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: CardFormCreate_textResponseBlockUpdate_action_NavigateToJourneyAction_journey_language;
}

export interface CardFormCreate_textResponseBlockUpdate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: CardFormCreate_textResponseBlockUpdate_action_NavigateToJourneyAction_journey | null;
}

export interface CardFormCreate_textResponseBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface CardFormCreate_textResponseBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type CardFormCreate_textResponseBlockUpdate_action = CardFormCreate_textResponseBlockUpdate_action_NavigateAction | CardFormCreate_textResponseBlockUpdate_action_NavigateToBlockAction | CardFormCreate_textResponseBlockUpdate_action_NavigateToJourneyAction | CardFormCreate_textResponseBlockUpdate_action_LinkAction | CardFormCreate_textResponseBlockUpdate_action_EmailAction;

export interface CardFormCreate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: CardFormCreate_textResponseBlockUpdate_action | null;
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
  submitIcon: CardFormCreate_submitIcon;
  textResponseBlockUpdate: CardFormCreate_textResponseBlockUpdate | null;
  body: CardFormCreate_body;
  cardBlockUpdate: CardFormCreate_cardBlockUpdate;
}

export interface CardFormCreateVariables {
  imageInput: ImageBlockCreateInput;
  subtitleInput: TypographyBlockCreateInput;
  titleInput: TypographyBlockCreateInput;
  textResponseInput: TextResponseBlockCreateInput;
  submitIconInput: IconBlockCreateInput;
  textResponseId: string;
  textResponseUpdateInput: TextResponseBlockUpdateInput;
  bodyInput: TypographyBlockCreateInput;
  journeyId: string;
  cardId: string;
  cardInput: CardBlockUpdateInput;
}
