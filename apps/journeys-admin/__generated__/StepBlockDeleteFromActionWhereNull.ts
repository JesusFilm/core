/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StepBlockDeleteFromActionWhereNull
// ====================================================

export interface StepBlockDeleteFromActionWhereNull_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface StepBlockDeleteFromActionWhereNull_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type StepBlockDeleteFromActionWhereNull_blockDelete = StepBlockDeleteFromActionWhereNull_blockDelete_ImageBlock | StepBlockDeleteFromActionWhereNull_blockDelete_StepBlock;

export interface StepBlockDeleteFromActionWhereNull_blockDeleteAction {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface StepBlockDeleteFromActionWhereNull {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: StepBlockDeleteFromActionWhereNull_blockDelete[];
  blockDeleteAction: StepBlockDeleteFromActionWhereNull_blockDeleteAction;
}

export interface StepBlockDeleteFromActionWhereNullVariables {
  id: string;
  journeyId: string;
  parentBlockId?: string | null;
  blockDeleteActionId: string;
}
