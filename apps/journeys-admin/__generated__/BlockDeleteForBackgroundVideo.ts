/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDeleteForBackgroundVideo
// ====================================================

export interface BlockDeleteForBackgroundVideo_blockDelete {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockDeleteForBackgroundVideo {
  blockDelete: BlockDeleteForBackgroundVideo_blockDelete[];
}

export interface BlockDeleteForBackgroundVideoVariables {
  id: string;
  parentBlockId: string;
  journeyId: string;
}
