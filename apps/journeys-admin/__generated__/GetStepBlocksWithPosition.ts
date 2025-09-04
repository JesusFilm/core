/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetStepBlocksWithPosition
// ====================================================

export interface GetStepBlocksWithPosition_blocks_ButtonBlock {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
}

export interface GetStepBlocksWithPosition_blocks_StepBlock {
  __typename: "StepBlock";
  id: string;
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

export type GetStepBlocksWithPosition_blocks = GetStepBlocksWithPosition_blocks_ButtonBlock | GetStepBlocksWithPosition_blocks_StepBlock;

export interface GetStepBlocksWithPosition {
  blocks: GetStepBlocksWithPosition_blocks[];
}

export interface GetStepBlocksWithPositionVariables {
  journeyIds?: string[] | null;
}
