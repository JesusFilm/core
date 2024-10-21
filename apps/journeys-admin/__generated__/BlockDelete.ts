/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDelete
// ====================================================

export interface BlockDelete_blockDelete_deletedBlocks_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDelete_blockDelete_deletedBlocks_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type BlockDelete_blockDelete_deletedBlocks = BlockDelete_blockDelete_deletedBlocks_ImageBlock | BlockDelete_blockDelete_deletedBlocks_StepBlock;

export interface BlockDelete_blockDelete_updatedBlocks_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockDelete_blockDelete_updatedBlocks_StepBlock {
  __typename: "StepBlock";
  id: string;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export interface BlockDelete_blockDelete_updatedBlocks_ButtonBlock_action_LinkAction {
  __typename: "LinkAction" | "EmailAction";
}

export interface BlockDelete_blockDelete_updatedBlocks_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  blockId: string;
}

export type BlockDelete_blockDelete_updatedBlocks_ButtonBlock_action = BlockDelete_blockDelete_updatedBlocks_ButtonBlock_action_LinkAction | BlockDelete_blockDelete_updatedBlocks_ButtonBlock_action_NavigateToBlockAction;

export interface BlockDelete_blockDelete_updatedBlocks_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: BlockDelete_blockDelete_updatedBlocks_ButtonBlock_action | null;
}

export interface BlockDelete_blockDelete_updatedBlocks_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction" | "EmailAction";
}

export interface BlockDelete_blockDelete_updatedBlocks_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  blockId: string;
}

export type BlockDelete_blockDelete_updatedBlocks_RadioOptionBlock_action = BlockDelete_blockDelete_updatedBlocks_RadioOptionBlock_action_LinkAction | BlockDelete_blockDelete_updatedBlocks_RadioOptionBlock_action_NavigateToBlockAction;

export interface BlockDelete_blockDelete_updatedBlocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  action: BlockDelete_blockDelete_updatedBlocks_RadioOptionBlock_action | null;
}

export type BlockDelete_blockDelete_updatedBlocks = BlockDelete_blockDelete_updatedBlocks_ImageBlock | BlockDelete_blockDelete_updatedBlocks_StepBlock | BlockDelete_blockDelete_updatedBlocks_ButtonBlock | BlockDelete_blockDelete_updatedBlocks_RadioOptionBlock;

export interface BlockDelete_blockDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: BlockDelete_blockDelete_deletedBlocks[];
  updatedBlocks: BlockDelete_blockDelete_updatedBlocks[];
}

export interface BlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDelete_blockDelete;
}

export interface BlockDeleteVariables {
  id: string;
}
