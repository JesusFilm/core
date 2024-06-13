/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StepDuplicate
// ====================================================

export interface StepDuplicate_blockDuplicate {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface StepDuplicate {
  /**
   * blockDuplicate returns the updated block, it's children and sibling blocks on successful duplicate
   */
  blockDuplicate: StepDuplicate_blockDuplicate[];
}

export interface StepDuplicateVariables {
  id: string;
  journeyId: string;
  parentOrder?: number | null;
  x?: number | null;
  y?: number | null;
}
