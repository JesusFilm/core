/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockUpdateActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepBlockDeleteFromAction
// ====================================================

export interface StepBlockDeleteFromAction_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface StepBlockDeleteFromAction_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type StepBlockDeleteFromAction_blockDelete = StepBlockDeleteFromAction_blockDelete_ImageBlock | StepBlockDeleteFromAction_blockDelete_StepBlock;

export interface StepBlockDeleteFromAction_blockUpdateAction_parentBlock {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface StepBlockDeleteFromAction_blockUpdateAction {
  __typename: "NavigateToBlockAction" | "LinkAction" | "EmailAction";
  parentBlockId: string | null;
  parentBlock: StepBlockDeleteFromAction_blockUpdateAction_parentBlock | null;
  gtmEventName: string | null;
}

export interface StepBlockDeleteFromAction {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: StepBlockDeleteFromAction_blockDelete[];
  blockUpdateAction: StepBlockDeleteFromAction_blockUpdateAction;
}

export interface StepBlockDeleteFromActionVariables {
  id: string;
  journeyId: string;
  parentBlockId?: string | null;
  input: BlockUpdateActionInput;
  blockUpdateActionId: string;
}
