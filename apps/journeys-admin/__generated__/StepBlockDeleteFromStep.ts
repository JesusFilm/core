/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepBlockDeleteFromStep
// ====================================================

export interface StepBlockDeleteFromStep_blockDelete_ButtonBlock {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface StepBlockDeleteFromStep_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type StepBlockDeleteFromStep_blockDelete = StepBlockDeleteFromStep_blockDelete_ButtonBlock | StepBlockDeleteFromStep_blockDelete_StepBlock;

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
  blockDelete: StepBlockDeleteFromStep_blockDelete[];
  stepBlockUpdate: StepBlockDeleteFromStep_stepBlockUpdate;
}

export interface StepBlockDeleteFromStepVariables {
  id: string;
  journeyId: string;
  input: StepBlockUpdateInput;
  stepBlockUpdateId: string;
}
