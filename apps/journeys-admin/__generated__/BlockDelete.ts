/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDelete
// ====================================================

export interface BlockDelete_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDelete_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to when a
   * NavigateAction occurs or if the user manually tries to advance to the next
   * step. If no nextBlockId is set it will automatically navigate to the next
   * step in the journey based on parentOrder.
   */
  nextBlockId: string | null;
}

export type BlockDelete_blockDelete = BlockDelete_blockDelete_ImageBlock | BlockDelete_blockDelete_StepBlock;

export interface BlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDelete_blockDelete[];
}

export interface BlockDeleteVariables {
  id: string;
  journeyId: string;
  parentBlockId?: string | null;
}
