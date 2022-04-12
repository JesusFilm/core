/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDeletePrimaryImage
// ====================================================

export interface BlockDeletePrimaryImage_blockDelete {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDeletePrimaryImage {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDeletePrimaryImage_blockDelete[];
}

export interface BlockDeletePrimaryImageVariables {
  id: string;
  parentBlockId: string;
  journeyId: string;
}
