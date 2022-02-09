/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NavigateToJourneyActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: NavigateToJourneyActionUpdate
// ====================================================

export interface NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_CardBlock {
  __typename: "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_ButtonBlock_action_LinkAction {
  __typename: "LinkAction" | "NavigateAction" | "NavigateToBlockAction";
}

export interface NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_ButtonBlock_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  journeyId: string;
}

export type NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_ButtonBlock_action = NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_ButtonBlock_action_LinkAction | NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_ButtonBlock_action_NavigateToJourneyAction;

export interface NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  action: NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_ButtonBlock_action | null;
}

export type NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction = NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_CardBlock | NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction_ButtonBlock;

export interface NavigateToJourneyActionUpdate {
  blockUpdateNavigateToJourneyAction: NavigateToJourneyActionUpdate_blockUpdateNavigateToJourneyAction;
}

export interface NavigateToJourneyActionUpdateVariables {
  id: string;
  journeyId: string;
  input: NavigateToJourneyActionInput;
}
