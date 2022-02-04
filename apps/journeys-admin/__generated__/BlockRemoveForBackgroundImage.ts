/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockRemoveForBackgroundImage
// ====================================================

export interface BlockRemoveForBackgroundImage_blockRemove {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockRemoveForBackgroundImage {
  blockRemove: BlockRemoveForBackgroundImage_blockRemove[];
}

export interface BlockRemoveForBackgroundImageVariables {
  id: string;
  journeyId: string;
}
