/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetStepBlockPositions
// ====================================================

export interface GetStepBlockPositions_blocks_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface GetStepBlockPositions_blocks_StepBlock {
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

export type GetStepBlockPositions_blocks = GetStepBlockPositions_blocks_ImageBlock | GetStepBlockPositions_blocks_StepBlock;

export interface GetStepBlockPositions {
  blocks: GetStepBlockPositions_blocks[];
}

export interface GetStepBlockPositionsVariables {
  journeyIds?: string[] | null;
}
