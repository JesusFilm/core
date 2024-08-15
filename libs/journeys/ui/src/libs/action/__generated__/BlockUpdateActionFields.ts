/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: BlockUpdateActionFields
// ====================================================

export interface BlockUpdateActionFields_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface BlockUpdateActionFields_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockUpdateActionFields_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockUpdateActionFields_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockUpdateActionFields_ButtonBlock_action = BlockUpdateActionFields_ButtonBlock_action_NavigateToBlockAction | BlockUpdateActionFields_ButtonBlock_action_LinkAction | BlockUpdateActionFields_ButtonBlock_action_EmailAction;

export interface BlockUpdateActionFields_ButtonBlock {
  __typename: "ButtonBlock";
  action: BlockUpdateActionFields_ButtonBlock_action | null;
}

export interface BlockUpdateActionFields_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockUpdateActionFields_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockUpdateActionFields_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockUpdateActionFields_FormBlock_action = BlockUpdateActionFields_FormBlock_action_NavigateToBlockAction | BlockUpdateActionFields_FormBlock_action_LinkAction | BlockUpdateActionFields_FormBlock_action_EmailAction;

export interface BlockUpdateActionFields_FormBlock {
  __typename: "FormBlock";
  action: BlockUpdateActionFields_FormBlock_action | null;
}

export interface BlockUpdateActionFields_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockUpdateActionFields_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockUpdateActionFields_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockUpdateActionFields_RadioOptionBlock_action = BlockUpdateActionFields_RadioOptionBlock_action_NavigateToBlockAction | BlockUpdateActionFields_RadioOptionBlock_action_LinkAction | BlockUpdateActionFields_RadioOptionBlock_action_EmailAction;

export interface BlockUpdateActionFields_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  action: BlockUpdateActionFields_RadioOptionBlock_action | null;
}

export interface BlockUpdateActionFields_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockUpdateActionFields_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockUpdateActionFields_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockUpdateActionFields_SignUpBlock_action = BlockUpdateActionFields_SignUpBlock_action_NavigateToBlockAction | BlockUpdateActionFields_SignUpBlock_action_LinkAction | BlockUpdateActionFields_SignUpBlock_action_EmailAction;

export interface BlockUpdateActionFields_SignUpBlock {
  __typename: "SignUpBlock";
  action: BlockUpdateActionFields_SignUpBlock_action | null;
}

export interface BlockUpdateActionFields_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface BlockUpdateActionFields_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface BlockUpdateActionFields_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type BlockUpdateActionFields_VideoBlock_action = BlockUpdateActionFields_VideoBlock_action_NavigateToBlockAction | BlockUpdateActionFields_VideoBlock_action_LinkAction | BlockUpdateActionFields_VideoBlock_action_EmailAction;

export interface BlockUpdateActionFields_VideoBlock {
  __typename: "VideoBlock";
  /**
   * action that should be performed when the video ends
   */
  action: BlockUpdateActionFields_VideoBlock_action | null;
}

export type BlockUpdateActionFields = BlockUpdateActionFields_ImageBlock | BlockUpdateActionFields_ButtonBlock | BlockUpdateActionFields_FormBlock | BlockUpdateActionFields_RadioOptionBlock | BlockUpdateActionFields_SignUpBlock | BlockUpdateActionFields_VideoBlock;
