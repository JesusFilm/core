/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateActionUpdate
// ====================================================

export interface NavigateActionUpdate_blockUpdateNavigateAction_CardBlock {
  __typename: "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface NavigateActionUpdate_blockUpdateNavigateAction_ButtonBlock_action_LinkAction {
  __typename: "LinkAction" | "NavigateToBlockAction" | "NavigateToJourneyAction";
}

export interface NavigateActionUpdate_blockUpdateNavigateAction_ButtonBlock_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export type NavigateActionUpdate_blockUpdateNavigateAction_ButtonBlock_action = NavigateActionUpdate_blockUpdateNavigateAction_ButtonBlock_action_LinkAction | NavigateActionUpdate_blockUpdateNavigateAction_ButtonBlock_action_NavigateAction;

export interface NavigateActionUpdate_blockUpdateNavigateAction_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: NavigateActionUpdate_blockUpdateNavigateAction_ButtonBlock_action | null;
}

export type NavigateActionUpdate_blockUpdateNavigateAction = NavigateActionUpdate_blockUpdateNavigateAction_CardBlock | NavigateActionUpdate_blockUpdateNavigateAction_ButtonBlock;

export interface NavigateActionUpdate {
  blockUpdateNavigateAction: NavigateActionUpdate_blockUpdateNavigateAction;
}

export interface NavigateActionUpdateVariables {
  id: string;
  journeyId: string;
  input: NavigateActionInput;
}
