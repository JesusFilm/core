/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockRemoveForBackgroundVideo
// ====================================================

export interface BlockRemoveForBackgroundVideo_blockRemove {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockRemoveForBackgroundVideo {
  blockRemove: BlockRemoveForBackgroundVideo_blockRemove[];
}

export interface BlockRemoveForBackgroundVideoVariables {
  id: string;
  journeyId: string;
}
