/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LinkActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: LinkActionUpdate
// ====================================================

export interface LinkActionUpdate_blockUpdateLinkAction_CardBlock {
  __typename: "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface LinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction" | "NavigateToBlockAction" | "NavigateToJourneyAction";
}

export interface LinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  url: string;
}

export type LinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action = LinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action_NavigateAction | LinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action_LinkAction;

export interface LinkActionUpdate_blockUpdateLinkAction_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: LinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action | null;
}

export type LinkActionUpdate_blockUpdateLinkAction = LinkActionUpdate_blockUpdateLinkAction_CardBlock | LinkActionUpdate_blockUpdateLinkAction_ButtonBlock;

export interface LinkActionUpdate {
  blockUpdateLinkAction: LinkActionUpdate_blockUpdateLinkAction;
}

export interface LinkActionUpdateVariables {
  id: string;
  journeyId: string;
  input: LinkActionInput;
}
