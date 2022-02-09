/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateToBlockActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateToStepActionUpdate
// ====================================================

export interface NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_CardBlock {
  __typename: "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action_LinkAction {
  __typename: "LinkAction" | "NavigateAction" | "NavigateToJourneyAction";
}

export interface NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  blockId: string;
}

export type NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action = NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action_LinkAction | NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action_NavigateToBlockAction;

export interface NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock_action | null;
}

export type NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction = NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_CardBlock | NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction_ButtonBlock;

export interface NavigateToStepActionUpdate {
  blockUpdateNavigateToBlockAction: NavigateToStepActionUpdate_blockUpdateNavigateToBlockAction;
}

export interface NavigateToStepActionUpdateVariables {
  id: string;
  journeyId: string;
  input: NavigateToBlockActionInput;
}
