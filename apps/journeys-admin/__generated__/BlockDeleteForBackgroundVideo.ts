/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDeleteForBackgroundVideo
// ====================================================

export interface BlockDeleteForBackgroundVideo_blockDelete {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDeleteForBackgroundVideo {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDeleteForBackgroundVideo_blockDelete[];
}

export interface BlockDeleteForBackgroundVideoVariables {
  id: string;
  parentBlockId: string;
  journeyId: string;
}
