/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockDeleteWithStepUpdate
// ====================================================

export interface BlockDeleteWithStepUpdate_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDeleteWithStepUpdate_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type BlockDeleteWithStepUpdate_blockDelete = BlockDeleteWithStepUpdate_blockDelete_ImageBlock | BlockDeleteWithStepUpdate_blockDelete_StepBlock;

export interface BlockDeleteWithStepUpdate_stepBlockUpdate {
  __typename: "StepBlock";
  id: string;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export interface BlockDeleteWithStepUpdate {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDeleteWithStepUpdate_blockDelete[];
  stepBlockUpdate: BlockDeleteWithStepUpdate_stepBlockUpdate;
}

export interface BlockDeleteWithStepUpdateVariables {
  id: string;
  journeyId: string;
  input: StepBlockUpdateInput;
  stepBlockUpdateId: string;
}
