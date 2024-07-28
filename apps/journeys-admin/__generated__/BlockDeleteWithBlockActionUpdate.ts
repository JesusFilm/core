/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockUpdateActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockDeleteWithBlockActionUpdate
// ====================================================

export interface BlockDeleteWithBlockActionUpdate_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockDeleteWithBlockActionUpdate_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type BlockDeleteWithBlockActionUpdate_blockDelete = BlockDeleteWithBlockActionUpdate_blockDelete_ImageBlock | BlockDeleteWithBlockActionUpdate_blockDelete_StepBlock;

export interface BlockDeleteWithBlockActionUpdate_blockUpdateAction_parentBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockDeleteWithBlockActionUpdate_blockUpdateAction {
  __typename: "NavigateToBlockAction" | "LinkAction" | "EmailAction";
  parentBlockId: string;
  parentBlock: BlockDeleteWithBlockActionUpdate_blockUpdateAction_parentBlock;
  gtmEventName: string | null;
}

export interface BlockDeleteWithBlockActionUpdate {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: BlockDeleteWithBlockActionUpdate_blockDelete[];
  blockUpdateAction: BlockDeleteWithBlockActionUpdate_blockUpdateAction;
}

export interface BlockDeleteWithBlockActionUpdateVariables {
  id: string;
  journeyId: string;
  parentBlockId?: string | null;
  input: BlockUpdateActionInput;
  blockUpdateActionId: string;
}
