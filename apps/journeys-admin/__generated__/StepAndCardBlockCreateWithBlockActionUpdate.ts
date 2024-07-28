/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockCreateInput, CardBlockCreateInput, BlockUpdateActionInput, ThemeMode, ThemeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepAndCardBlockCreateWithBlockActionUpdate
// ====================================================

export interface StepAndCardBlockCreateWithBlockActionUpdate_stepBlockCreate {
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
   * x is used to position the block horizontally in the journey flow diagram on
   * the editor.
   */
  x: number | null;
  /**
   * y is used to position the block vertically in the journey flow diagram on
   * the editor.
   */
  y: number | null;
}

export interface StepAndCardBlockCreateWithBlockActionUpdate_cardBlockCreate {
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

export interface StepAndCardBlockCreateWithBlockActionUpdate_blockUpdateAction_parentBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface StepAndCardBlockCreateWithBlockActionUpdate_blockUpdateAction {
  __typename: "NavigateToBlockAction" | "LinkAction" | "EmailAction";
  parentBlockId: string;
  parentBlock: StepAndCardBlockCreateWithBlockActionUpdate_blockUpdateAction_parentBlock;
  gtmEventName: string | null;
}

export interface StepAndCardBlockCreateWithBlockActionUpdate {
  stepBlockCreate: StepAndCardBlockCreateWithBlockActionUpdate_stepBlockCreate;
  cardBlockCreate: StepAndCardBlockCreateWithBlockActionUpdate_cardBlockCreate;
  blockUpdateAction: StepAndCardBlockCreateWithBlockActionUpdate_blockUpdateAction;
}

export interface StepAndCardBlockCreateWithBlockActionUpdateVariables {
  stepBlockCreateInput: StepBlockCreateInput;
  cardBlockCreateInput: CardBlockCreateInput;
  blockId: string;
  blockUpdateActionInput: BlockUpdateActionInput;
}
