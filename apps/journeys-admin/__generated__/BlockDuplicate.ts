/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDuplicate
// ====================================================

export interface BlockDuplicate_blockDuplicate {
  __typename: "ButtonBlock" | "CardBlock" | "FormBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockDuplicate {
  /**
   * blockDuplicate returns the updated block, it's children and sibling blocks on successful duplicate
   */
  blockDuplicate: BlockDuplicate_blockDuplicate[];
}

export interface BlockDuplicateVariables {
  id: string;
  journeyId: string;
  parentOrder?: number | null;
}
