/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDeleteWithBlockOrderUpdate
// ====================================================

export interface BlockDeleteWithBlockOrderUpdate_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDeleteWithBlockOrderUpdate_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type BlockDeleteWithBlockOrderUpdate_blockDelete = BlockDeleteWithBlockOrderUpdate_blockDelete_ImageBlock | BlockDeleteWithBlockOrderUpdate_blockDelete_StepBlock;

export interface BlockDeleteWithBlockOrderUpdate_blockOrderUpdate {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDeleteWithBlockOrderUpdate {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDeleteWithBlockOrderUpdate_blockDelete[];
  blockOrderUpdate: BlockDeleteWithBlockOrderUpdate_blockOrderUpdate[];
}

export interface BlockDeleteWithBlockOrderUpdateVariables {
  id: string;
  journeyId: string;
  parentOrder: number;
  stepId: string;
}
