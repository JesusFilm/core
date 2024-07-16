/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ActionDelete
// ====================================================

export interface ActionDelete_blockDeleteAction_ImageBlock {
  __typename: "ImageBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface ActionDelete_blockDeleteAction_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ActionDelete_blockDeleteAction_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface ActionDelete_blockDeleteAction_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type ActionDelete_blockDeleteAction_ButtonBlock_action = ActionDelete_blockDeleteAction_ButtonBlock_action_NavigateToBlockAction | ActionDelete_blockDeleteAction_ButtonBlock_action_LinkAction | ActionDelete_blockDeleteAction_ButtonBlock_action_EmailAction;

export interface ActionDelete_blockDeleteAction_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: ActionDelete_blockDeleteAction_ButtonBlock_action | null;
}

export interface ActionDelete_blockDeleteAction_FormBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ActionDelete_blockDeleteAction_FormBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface ActionDelete_blockDeleteAction_FormBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type ActionDelete_blockDeleteAction_FormBlock_action = ActionDelete_blockDeleteAction_FormBlock_action_NavigateToBlockAction | ActionDelete_blockDeleteAction_FormBlock_action_LinkAction | ActionDelete_blockDeleteAction_FormBlock_action_EmailAction;

export interface ActionDelete_blockDeleteAction_FormBlock {
  __typename: "FormBlock";
  id: string;
  action: ActionDelete_blockDeleteAction_FormBlock_action | null;
}

export interface ActionDelete_blockDeleteAction_RadioOptionBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ActionDelete_blockDeleteAction_RadioOptionBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface ActionDelete_blockDeleteAction_RadioOptionBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type ActionDelete_blockDeleteAction_RadioOptionBlock_action = ActionDelete_blockDeleteAction_RadioOptionBlock_action_NavigateToBlockAction | ActionDelete_blockDeleteAction_RadioOptionBlock_action_LinkAction | ActionDelete_blockDeleteAction_RadioOptionBlock_action_EmailAction;

export interface ActionDelete_blockDeleteAction_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  action: ActionDelete_blockDeleteAction_RadioOptionBlock_action | null;
}

export interface ActionDelete_blockDeleteAction_SignUpBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ActionDelete_blockDeleteAction_SignUpBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface ActionDelete_blockDeleteAction_SignUpBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type ActionDelete_blockDeleteAction_SignUpBlock_action = ActionDelete_blockDeleteAction_SignUpBlock_action_NavigateToBlockAction | ActionDelete_blockDeleteAction_SignUpBlock_action_LinkAction | ActionDelete_blockDeleteAction_SignUpBlock_action_EmailAction;

export interface ActionDelete_blockDeleteAction_SignUpBlock {
  __typename: "SignUpBlock";
  id: string;
  action: ActionDelete_blockDeleteAction_SignUpBlock_action | null;
}

export interface ActionDelete_blockDeleteAction_VideoBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ActionDelete_blockDeleteAction_VideoBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface ActionDelete_blockDeleteAction_VideoBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type ActionDelete_blockDeleteAction_VideoBlock_action = ActionDelete_blockDeleteAction_VideoBlock_action_NavigateToBlockAction | ActionDelete_blockDeleteAction_VideoBlock_action_LinkAction | ActionDelete_blockDeleteAction_VideoBlock_action_EmailAction;

export interface ActionDelete_blockDeleteAction_VideoBlock {
  __typename: "VideoBlock";
  id: string;
  /**
   * action that should be performed when the video ends
   */
  action: ActionDelete_blockDeleteAction_VideoBlock_action | null;
}

export type ActionDelete_blockDeleteAction = ActionDelete_blockDeleteAction_ImageBlock | ActionDelete_blockDeleteAction_ButtonBlock | ActionDelete_blockDeleteAction_FormBlock | ActionDelete_blockDeleteAction_RadioOptionBlock | ActionDelete_blockDeleteAction_SignUpBlock | ActionDelete_blockDeleteAction_VideoBlock;

export interface ActionDelete {
  blockDeleteAction: ActionDelete_blockDeleteAction;
}

export interface ActionDeleteVariables {
  id: string;
  journeyId: string;
}
