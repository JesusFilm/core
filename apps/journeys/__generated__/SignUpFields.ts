/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IconName, IconColor, IconSize } from "./globalTypes";

// ====================================================
// GraphQL fragment: SignUpFields
// ====================================================

export interface SignUpFields_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface SignUpFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface SignUpFields_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface SignUpFields_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journey: SignUpFields_action_NavigateToJourneyAction_journey | null;
}

export interface SignUpFields_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type SignUpFields_action = SignUpFields_action_NavigateAction | SignUpFields_action_NavigateToBlockAction | SignUpFields_action_NavigateToJourneyAction | SignUpFields_action_LinkAction;

export interface SignUpFields_submitIcon {
  __typename: "Icon";
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface SignUpFields {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  action: SignUpFields_action | null;
  submitIcon: SignUpFields_submitIcon | null;
}
