/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EmailActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EmailActionUpdate
// ====================================================

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action = EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_NavigateToBlockAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_LinkAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action_EmailAction;

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock_action | null;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action = EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_NavigateToBlockAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_LinkAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action_EmailAction;

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock {
  __typename: "FormBlock";
  id: string;
  action: EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock_action | null;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action = EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_LinkAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action_EmailAction;

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  action: EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock_action | null;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action = EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_NavigateToBlockAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_LinkAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action_EmailAction;

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  action: EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock_action | null;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action = EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_NavigateToBlockAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_LinkAction | EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action_EmailAction;

export interface EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  /**
   * action that should be performed when the video ends
   */
  action: EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock_action | null;
}

export type EmailActionUpdate_blockUpdateEmailAction_parentBlock = EmailActionUpdate_blockUpdateEmailAction_parentBlock_ImageBlock | EmailActionUpdate_blockUpdateEmailAction_parentBlock_ButtonBlock | EmailActionUpdate_blockUpdateEmailAction_parentBlock_FormBlock | EmailActionUpdate_blockUpdateEmailAction_parentBlock_RadioOptionBlock | EmailActionUpdate_blockUpdateEmailAction_parentBlock_SignUpBlock | EmailActionUpdate_blockUpdateEmailAction_parentBlock_VideoBlock;

export interface EmailActionUpdate_blockUpdateEmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  parentBlock: EmailActionUpdate_blockUpdateEmailAction_parentBlock;
}

export interface EmailActionUpdate {
  blockUpdateEmailAction: EmailActionUpdate_blockUpdateEmailAction;
}

export interface EmailActionUpdateVariables {
  id: string;
  input: EmailActionInput;
}
