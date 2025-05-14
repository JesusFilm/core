/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AiBlockDeleteMutation
// ====================================================

export interface AiBlockDeleteMutation_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface AiBlockDeleteMutation_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type AiBlockDeleteMutation_blockDelete = AiBlockDeleteMutation_blockDelete_ImageBlock | AiBlockDeleteMutation_blockDelete_StepBlock;

export interface AiBlockDeleteMutation {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: AiBlockDeleteMutation_blockDelete[];
}

export interface AiBlockDeleteMutationVariables {
  id: string;
}
