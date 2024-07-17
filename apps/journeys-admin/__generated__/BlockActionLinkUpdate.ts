/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LinkActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockActionLinkUpdate
// ====================================================

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action = BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_NavigateToBlockAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_LinkAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_EmailAction;

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action | null;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action = BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_NavigateToBlockAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_LinkAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_EmailAction;

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock {
  __typename: "FormBlock";
  id: string;
  action: BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action | null;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action = BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_LinkAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_EmailAction;

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  action: BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action | null;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action = BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_NavigateToBlockAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_LinkAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_EmailAction;

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  action: BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action | null;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action = BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_NavigateToBlockAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_LinkAction | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_EmailAction;

export interface BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  /**
   * action that should be performed when the video ends
   */
  action: BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action | null;
}

export type BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock = BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ImageBlock | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_FormBlock | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock | BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock_VideoBlock;

export interface BlockActionLinkUpdate_blockUpdateLinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  parentBlock: BlockActionLinkUpdate_blockUpdateLinkAction_parentBlock;
}

export interface BlockActionLinkUpdate {
  blockUpdateLinkAction: BlockActionLinkUpdate_blockUpdateLinkAction;
}

export interface BlockActionLinkUpdateVariables {
  id: string;
  input: LinkActionInput;
}
