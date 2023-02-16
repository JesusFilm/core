/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ImageBlockDelete
// ====================================================

export interface ImageBlockDelete_blockDelete {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface ImageBlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: ImageBlockDelete_blockDelete[];
}

export interface ImageBlockDeleteVariables {
  id: string;
  parentBlockId: string;
  journeyId: string;
}
