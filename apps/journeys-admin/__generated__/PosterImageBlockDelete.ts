/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PosterImageBlockDelete
// ====================================================

export interface PosterImageBlockDelete_blockDelete {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface PosterImageBlockDelete_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  posterBlockId: string | null;
}

export interface PosterImageBlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: PosterImageBlockDelete_blockDelete[];
  videoBlockUpdate: PosterImageBlockDelete_videoBlockUpdate;
}

export interface PosterImageBlockDeleteVariables {
  id: string;
  parentBlockId: string;
}
