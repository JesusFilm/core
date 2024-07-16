/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LinkActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: LinkActionUpdate
// ====================================================

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action = LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_NavigateToBlockAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_LinkAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action_EmailAction;

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock_action | null;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action = LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_NavigateToBlockAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_LinkAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action_EmailAction;

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock {
  __typename: "FormBlock";
  id: string;
  action: LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock_action | null;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action = LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_LinkAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action_EmailAction;

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  action: LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock_action | null;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action = LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_NavigateToBlockAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_LinkAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action_EmailAction;

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  action: LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock_action | null;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action = LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_NavigateToBlockAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_LinkAction | LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action_EmailAction;

export interface LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  /**
   * action that should be performed when the video ends
   */
  action: LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock_action | null;
}

export type LinkActionUpdate_blockUpdateLinkAction_parentBlock = LinkActionUpdate_blockUpdateLinkAction_parentBlock_ImageBlock | LinkActionUpdate_blockUpdateLinkAction_parentBlock_ButtonBlock | LinkActionUpdate_blockUpdateLinkAction_parentBlock_FormBlock | LinkActionUpdate_blockUpdateLinkAction_parentBlock_RadioOptionBlock | LinkActionUpdate_blockUpdateLinkAction_parentBlock_SignUpBlock | LinkActionUpdate_blockUpdateLinkAction_parentBlock_VideoBlock;

export interface LinkActionUpdate_blockUpdateLinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  parentBlock: LinkActionUpdate_blockUpdateLinkAction_parentBlock;
}

export interface LinkActionUpdate {
  blockUpdateLinkAction: LinkActionUpdate_blockUpdateLinkAction;
}

export interface LinkActionUpdateVariables {
  id: string;
  input: LinkActionInput;
}
