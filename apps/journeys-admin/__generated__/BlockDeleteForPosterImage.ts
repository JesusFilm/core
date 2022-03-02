/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDeleteForPosterImage
// ====================================================

export interface BlockDeleteForPosterImage_blockDelete {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockDeleteForPosterImage {
  blockDelete: BlockDeleteForPosterImage_blockDelete[];
}

export interface BlockDeleteForPosterImageVariables {
  id: string;
  parentBlockId: string;
  journeyId: string;
}
