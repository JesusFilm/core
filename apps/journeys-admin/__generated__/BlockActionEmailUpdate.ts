/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EmailActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockActionEmailUpdate
// ====================================================

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action = BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_NavigateToBlockAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_LinkAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_EmailAction;

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action | null;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action = BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_NavigateToBlockAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_LinkAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_EmailAction;

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock {
  __typename: "FormBlock";
  id: string;
  action: BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action | null;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action = BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_LinkAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_EmailAction;

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  action: BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action | null;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action = BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_NavigateToBlockAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_LinkAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_EmailAction;

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  action: BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action | null;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action = BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_NavigateToBlockAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_LinkAction | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_EmailAction;

export interface BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  /**
   * action that should be performed when the video ends
   */
  action: BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action | null;
}

export type BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock = BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ImageBlock | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_FormBlock | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock | BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock_VideoBlock;

export interface BlockActionEmailUpdate_blockUpdateEmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  parentBlock: BlockActionEmailUpdate_blockUpdateEmailAction_parentBlock;
}

export interface BlockActionEmailUpdate {
  blockUpdateEmailAction: BlockActionEmailUpdate_blockUpdateEmailAction;
}

export interface BlockActionEmailUpdateVariables {
  id: string;
  input: EmailActionInput;
}
