/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LinkActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateToLinkActionUpdate
// ====================================================

export interface NavigateToLinkActionUpdate_blockUpdateLinkAction_CardBlock {
  __typename: "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface NavigateToLinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction" | "NavigateToBlockAction" | "NavigateToJourneyAction";
}

export interface NavigateToLinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  url: string;
}

export type NavigateToLinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action = NavigateToLinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action_NavigateAction | NavigateToLinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action_LinkAction;

export interface NavigateToLinkActionUpdate_blockUpdateLinkAction_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: NavigateToLinkActionUpdate_blockUpdateLinkAction_ButtonBlock_action | null;
}

export type NavigateToLinkActionUpdate_blockUpdateLinkAction = NavigateToLinkActionUpdate_blockUpdateLinkAction_CardBlock | NavigateToLinkActionUpdate_blockUpdateLinkAction_ButtonBlock;

export interface NavigateToLinkActionUpdate {
  blockUpdateLinkAction: NavigateToLinkActionUpdate_blockUpdateLinkAction;
}

export interface NavigateToLinkActionUpdateVariables {
  id: string;
  journeyId: string;
  input: LinkActionInput;
}
