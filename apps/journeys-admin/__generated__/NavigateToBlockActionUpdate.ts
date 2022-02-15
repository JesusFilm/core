/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateToBlockActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateToBlockActionUpdate
// ====================================================

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_CardBlock {
  __typename: "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action_LinkAction {
  __typename: "LinkAction" | "NavigateAction" | "NavigateToJourneyAction";
}

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  blockId: string;
}

export type NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action = NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action_LinkAction | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action_NavigateToBlockAction;

export interface NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action | null;
}

export type NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction = NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_CardBlock | NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock;

export interface NavigateToBlockActionUpdate {
  blockUpdateNavigateToBlockAction: NavigateToBlockActionUpdate_blockUpdateNavigateToBlockAction;
}

export interface NavigateToBlockActionUpdateVariables {
  id: string;
  journeyId: string;
  input: NavigateToBlockActionInput;
}
