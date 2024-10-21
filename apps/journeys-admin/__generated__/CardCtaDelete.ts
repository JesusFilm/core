/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput, ThemeMode, ThemeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardCtaDelete
// ====================================================

export interface CardCtaDelete_cardBlockUpdate {
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

export interface CardCtaDelete_endIcon3Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_endIcon3Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_endIcon3Delete_deletedBlocks[];
}

export interface CardCtaDelete_startIcon3Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_startIcon3Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_startIcon3Delete_deletedBlocks[];
}

export interface CardCtaDelete_button3Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_button3Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_button3Delete_deletedBlocks[];
}

export interface CardCtaDelete_endIcon2Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_endIcon2Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_endIcon2Delete_deletedBlocks[];
}

export interface CardCtaDelete_startIcon2Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_startIcon2Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_startIcon2Delete_deletedBlocks[];
}

export interface CardCtaDelete_button2Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_button2Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_button2Delete_deletedBlocks[];
}

export interface CardCtaDelete_endIcon1Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_endIcon1Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_endIcon1Delete_deletedBlocks[];
}

export interface CardCtaDelete_startIcon1Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_startIcon1Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_startIcon1Delete_deletedBlocks[];
}

export interface CardCtaDelete_button1Delete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_button1Delete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_button1Delete_deletedBlocks[];
}

export interface CardCtaDelete_titleDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_titleDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_titleDelete_deletedBlocks[];
}

export interface CardCtaDelete_subtitleDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_subtitleDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_subtitleDelete_deletedBlocks[];
}

export interface CardCtaDelete_imageDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardCtaDelete_imageDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardCtaDelete_imageDelete_deletedBlocks[];
}

export interface CardCtaDelete {
  cardBlockUpdate: CardCtaDelete_cardBlockUpdate;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  endIcon3Delete: CardCtaDelete_endIcon3Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  startIcon3Delete: CardCtaDelete_startIcon3Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  button3Delete: CardCtaDelete_button3Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  endIcon2Delete: CardCtaDelete_endIcon2Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  startIcon2Delete: CardCtaDelete_startIcon2Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  button2Delete: CardCtaDelete_button2Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  endIcon1Delete: CardCtaDelete_endIcon1Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  startIcon1Delete: CardCtaDelete_startIcon1Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  button1Delete: CardCtaDelete_button1Delete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  titleDelete: CardCtaDelete_titleDelete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  subtitleDelete: CardCtaDelete_subtitleDelete;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  imageDelete: CardCtaDelete_imageDelete;
}

export interface CardCtaDeleteVariables {
  imageId: string;
  subtitleId: string;
  titleId: string;
  button1Id: string;
  startIcon1Id: string;
  endIcon1Id: string;
  button2Id: string;
  startIcon2Id: string;
  endIcon2Id: string;
  button3Id: string;
  startIcon3Id: string;
  endIcon3Id: string;
  cardId: string;
  cardInput: CardBlockUpdateInput;
}
