/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput, ThemeMode, ThemeName, TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MenuBlockRestore
// ====================================================

export interface MenuBlockRestore_stepRestore_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface MenuBlockRestore_stepRestore_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export type MenuBlockRestore_stepRestore = MenuBlockRestore_stepRestore_ImageBlock | MenuBlockRestore_stepRestore_StepBlock;

export interface MenuBlockRestore_cardRestore_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface MenuBlockRestore_cardRestore_CardBlock {
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

export type MenuBlockRestore_cardRestore = MenuBlockRestore_cardRestore_ImageBlock | MenuBlockRestore_cardRestore_CardBlock;

export interface MenuBlockRestore_typographyRestore_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface MenuBlockRestore_typographyRestore_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export type MenuBlockRestore_typographyRestore = MenuBlockRestore_typographyRestore_ImageBlock | MenuBlockRestore_typographyRestore_TypographyBlock;

export interface MenuBlockRestore_journeyUpdate_menuStepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface MenuBlockRestore_journeyUpdate {
  __typename: "Journey";
  menuStepBlock: MenuBlockRestore_journeyUpdate_menuStepBlock | null;
}

export interface MenuBlockRestore {
  /**
   * blockRestore is used for redo/undo
   */
  stepRestore: MenuBlockRestore_stepRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  cardRestore: MenuBlockRestore_cardRestore[];
  /**
   * blockRestore is used for redo/undo
   */
  typographyRestore: MenuBlockRestore_typographyRestore[];
  journeyUpdate: MenuBlockRestore_journeyUpdate;
}

export interface MenuBlockRestoreVariables {
  journeyId: string;
  stepId: string;
  cardId: string;
  typographyId: string;
  journeyUpdateInput: JourneyUpdateInput;
}
