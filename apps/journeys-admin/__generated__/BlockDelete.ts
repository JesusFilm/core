/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockDelete
// ====================================================

export interface BlockDelete_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDelete_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type BlockDelete_blockDelete = BlockDelete_blockDelete_ImageBlock | BlockDelete_blockDelete_StepBlock;

export interface BlockDelete_blockDeleteReferences_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockDelete_blockDeleteReferences_StepBlock {
  __typename: "StepBlock";
  id: string;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export interface BlockDelete_blockDeleteReferences_ButtonBlock_action_LinkAction {
  __typename: "LinkAction" | "EmailAction";
}

export interface BlockDelete_blockDeleteReferences_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  blockId: string;
}

export type BlockDelete_blockDeleteReferences_ButtonBlock_action = BlockDelete_blockDeleteReferences_ButtonBlock_action_LinkAction | BlockDelete_blockDeleteReferences_ButtonBlock_action_NavigateToBlockAction;

export interface BlockDelete_blockDeleteReferences_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: BlockDelete_blockDeleteReferences_ButtonBlock_action | null;
}

export interface BlockDelete_blockDeleteReferences_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction" | "EmailAction";
}

export interface BlockDelete_blockDeleteReferences_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  blockId: string;
}

export type BlockDelete_blockDeleteReferences_RadioOptionBlock_action = BlockDelete_blockDeleteReferences_RadioOptionBlock_action_LinkAction | BlockDelete_blockDeleteReferences_RadioOptionBlock_action_NavigateToBlockAction;

export interface BlockDelete_blockDeleteReferences_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  action: BlockDelete_blockDeleteReferences_RadioOptionBlock_action | null;
}

export type BlockDelete_blockDeleteReferences = BlockDelete_blockDeleteReferences_ImageBlock | BlockDelete_blockDeleteReferences_StepBlock | BlockDelete_blockDeleteReferences_ButtonBlock | BlockDelete_blockDeleteReferences_RadioOptionBlock;

export interface BlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDelete_blockDelete[];
  /**
   * blockDeleteReferences removes references to a given block and returns the affected blocks
   */
  blockDeleteReferences: BlockDelete_blockDeleteReferences[];
}

export interface BlockDeleteVariables {
  id: string;
}
