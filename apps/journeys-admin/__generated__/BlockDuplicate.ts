/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDuplicate
// ====================================================

export interface BlockDuplicate_blockDuplicate_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_CardBlock {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_GridContainerBlock {
  __typename: "GridContainerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_GridItemBlock {
  __typename: "GridItemBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface BlockDuplicate_blockDuplicate_VideoTriggerBlock {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export type BlockDuplicate_blockDuplicate = BlockDuplicate_blockDuplicate_ButtonBlock | BlockDuplicate_blockDuplicate_CardBlock | BlockDuplicate_blockDuplicate_GridContainerBlock | BlockDuplicate_blockDuplicate_GridItemBlock | BlockDuplicate_blockDuplicate_IconBlock | BlockDuplicate_blockDuplicate_ImageBlock | BlockDuplicate_blockDuplicate_RadioOptionBlock | BlockDuplicate_blockDuplicate_RadioQuestionBlock | BlockDuplicate_blockDuplicate_SignUpBlock | BlockDuplicate_blockDuplicate_StepBlock | BlockDuplicate_blockDuplicate_TypographyBlock | BlockDuplicate_blockDuplicate_VideoBlock | BlockDuplicate_blockDuplicate_VideoTriggerBlock;

export interface BlockDuplicate {
  /**
   * blockDuplicate returns the updated block, it's children and sibling blocks on successful duplicate
   */
  blockDuplicate: BlockDuplicate_blockDuplicate[];
}

export interface BlockDuplicateVariables {
  id: string;
  journeyId: string;
  parentOrder: number;
}
