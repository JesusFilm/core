/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateToBlockActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateToBlockActionUpdate
// ====================================================

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock_action = NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock_action_NavigateToBlockAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock_action_LinkAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock_action_EmailAction;

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock_action | null;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock_action = NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock_action_NavigateToBlockAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock_action_LinkAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock_action_EmailAction;

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock {
  __typename: "FormBlock";
  id: string;
  action: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock_action | null;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock_action = NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock_action_NavigateToBlockAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock_action_LinkAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock_action_EmailAction;

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  action: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock_action | null;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock_action = NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock_action_NavigateToBlockAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock_action_LinkAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock_action_EmailAction;

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  action: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock_action | null;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock_action = NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock_action_NavigateToBlockAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock_action_LinkAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock_action_EmailAction;

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  /**
   * action that should be performed when the video ends
   */
  action: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock_action | null;
}

export type NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock = NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ImageBlock | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_ButtonBlock | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_FormBlock | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_RadioOptionBlock | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_SignUpBlock | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock_VideoBlock;

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  parentBlock: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_parentBlock;
}

export interface NavigateToBlockActionUpdate {
  blockUpdateNavigateToBlockAction: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction;
}

export interface NavigateToBlockActionUpdateVariables {
  id: string;
  input: NavigateToBlockActionInput;
}
