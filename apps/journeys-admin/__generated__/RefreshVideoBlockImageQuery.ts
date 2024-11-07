/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: RefreshVideoBlockImageQuery
// ====================================================

export interface RefreshVideoBlockImageQuery_block_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface RefreshVideoBlockImageQuery_block_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  /**
   * internal source videos: this field is not populated and instead only present
   * in the video field
   * For other sources this is automatically populated.
   */
  image: string | null;
}

export type RefreshVideoBlockImageQuery_block = RefreshVideoBlockImageQuery_block_ImageBlock | RefreshVideoBlockImageQuery_block_VideoBlock;

export interface RefreshVideoBlockImageQuery {
  block: RefreshVideoBlockImageQuery_block;
}

export interface RefreshVideoBlockImageQueryVariables {
  id: string;
}
