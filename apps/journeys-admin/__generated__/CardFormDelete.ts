/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput, ThemeMode, ThemeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardFormDelete
// ====================================================

export interface CardFormDelete_body {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardFormDelete_textResponse {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardFormDelete_title {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardFormDelete_subtitle {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardFormDelete_image {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardFormDelete_cardBlockUpdate {
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

export interface CardFormDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  body: CardFormDelete_body[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  textResponse: CardFormDelete_textResponse[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  title: CardFormDelete_title[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  subtitle: CardFormDelete_subtitle[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  image: CardFormDelete_image[];
  cardBlockUpdate: CardFormDelete_cardBlockUpdate;
}

export interface CardFormDeleteVariables {
  imageId: string;
  subtitleId: string;
  titleId: string;
  textResponseId: string;
  bodyId: string;
  cardId: string;
  journeyId: string;
  cardInput: CardBlockUpdateInput;
}
