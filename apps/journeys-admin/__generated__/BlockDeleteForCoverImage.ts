/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDeleteForCoverImage
// ====================================================

export interface BlockDeleteForCoverImage_blockDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDeleteForCoverImage_blockDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: BlockDeleteForCoverImage_blockDelete_deletedBlocks[];
}

export interface BlockDeleteForCoverImage {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDeleteForCoverImage_blockDelete;
}

export interface BlockDeleteForCoverImageVariables {
  blockDeleteId: string;
  journeyId: string;
  parentBlockId?: string | null;
}
