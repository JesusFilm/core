/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StepBlockDeleteFromActionWithoutAction
// ====================================================

export interface StepBlockDeleteFromActionWithoutAction_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface StepBlockDeleteFromActionWithoutAction_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type StepBlockDeleteFromActionWithoutAction_blockDelete = StepBlockDeleteFromActionWithoutAction_blockDelete_ImageBlock | StepBlockDeleteFromActionWithoutAction_blockDelete_StepBlock;

export interface StepBlockDeleteFromActionWithoutAction_blockDeleteAction_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "TypographyBlock";
  id: string;
}

export interface StepBlockDeleteFromActionWithoutAction_blockDeleteAction_RadioOptionBlock_action {
  __typename: "NavigateToBlockAction" | "LinkAction" | "EmailAction";
  parentBlockId: string | null;
}

export interface StepBlockDeleteFromActionWithoutAction_blockDeleteAction_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  action: StepBlockDeleteFromActionWithoutAction_blockDeleteAction_RadioOptionBlock_action | null;
}

export interface StepBlockDeleteFromActionWithoutAction_blockDeleteAction_ButtonBlock_action {
  __typename: "NavigateToBlockAction" | "LinkAction" | "EmailAction";
  parentBlockId: string | null;
}

export interface StepBlockDeleteFromActionWithoutAction_blockDeleteAction_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: StepBlockDeleteFromActionWithoutAction_blockDeleteAction_ButtonBlock_action | null;
}

export interface StepBlockDeleteFromActionWithoutAction_blockDeleteAction_SignUpBlock_action {
  __typename: "NavigateToBlockAction" | "LinkAction" | "EmailAction";
  parentBlockId: string | null;
}

export interface StepBlockDeleteFromActionWithoutAction_blockDeleteAction_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  action: StepBlockDeleteFromActionWithoutAction_blockDeleteAction_SignUpBlock_action | null;
}

export interface StepBlockDeleteFromActionWithoutAction_blockDeleteAction_VideoBlock_action {
  __typename: "NavigateToBlockAction" | "LinkAction" | "EmailAction";
  parentBlockId: string | null;
}

export interface StepBlockDeleteFromActionWithoutAction_blockDeleteAction_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  action: StepBlockDeleteFromActionWithoutAction_blockDeleteAction_VideoBlock_action | null;
}

export type StepBlockDeleteFromActionWithoutAction_blockDeleteAction = StepBlockDeleteFromActionWithoutAction_blockDeleteAction_ImageBlock | StepBlockDeleteFromActionWithoutAction_blockDeleteAction_RadioOptionBlock | StepBlockDeleteFromActionWithoutAction_blockDeleteAction_ButtonBlock | StepBlockDeleteFromActionWithoutAction_blockDeleteAction_SignUpBlock | StepBlockDeleteFromActionWithoutAction_blockDeleteAction_VideoBlock;

export interface StepBlockDeleteFromActionWithoutAction {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: StepBlockDeleteFromActionWithoutAction_blockDelete[];
  blockDeleteAction: StepBlockDeleteFromActionWithoutAction_blockDeleteAction | null;
}

export interface StepBlockDeleteFromActionWithoutActionVariables {
  id: string;
  journeyId: string;
  parentBlockId?: string | null;
  blockDeleteActionId: string;
}
