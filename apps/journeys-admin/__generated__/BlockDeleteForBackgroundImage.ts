/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDeleteForBackgroundImage
// ====================================================

export interface BlockDeleteForBackgroundImage_blockDelete {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDeleteForBackgroundImage {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDeleteForBackgroundImage_blockDelete[];
}

export interface BlockDeleteForBackgroundImageVariables {
  id: string;
  parentBlockId: string;
  journeyId: string;
}
