/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepBlockDeleteFromStep
// ====================================================

export interface StepBlockDeleteFromStep_blockDelete_deletedBlocks_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface StepBlockDeleteFromStep_blockDelete_deletedBlocks_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type StepBlockDeleteFromStep_blockDelete_deletedBlocks = StepBlockDeleteFromStep_blockDelete_deletedBlocks_ImageBlock | StepBlockDeleteFromStep_blockDelete_deletedBlocks_StepBlock;

export interface StepBlockDeleteFromStep_blockDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: StepBlockDeleteFromStep_blockDelete_deletedBlocks[];
}

export interface StepBlockDeleteFromStep_stepBlockUpdate {
  __typename: "StepBlock";
  id: string;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export interface StepBlockDeleteFromStep {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: StepBlockDeleteFromStep_blockDelete;
  stepBlockUpdate: StepBlockDeleteFromStep_stepBlockUpdate;
}

export interface StepBlockDeleteFromStepVariables {
  id: string;
  journeyId: string;
  input: StepBlockUpdateInput;
  stepBlockUpdateId: string;
}
