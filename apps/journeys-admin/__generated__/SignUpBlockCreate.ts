/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SignUpBlockCreateInput, IconBlockCreateInput, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SignUpBlockCreate
// ====================================================

export interface SignUpBlockCreate_signUpBlockCreate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface SignUpBlockCreate_signUpBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface SignUpBlockCreate_signUpBlockCreate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface SignUpBlockCreate_signUpBlockCreate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: SignUpBlockCreate_signUpBlockCreate_action_NavigateToJourneyAction_journey | null;
}

export interface SignUpBlockCreate_signUpBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export type SignUpBlockCreate_signUpBlockCreate_action = SignUpBlockCreate_signUpBlockCreate_action_NavigateAction | SignUpBlockCreate_signUpBlockCreate_action_NavigateToBlockAction | SignUpBlockCreate_signUpBlockCreate_action_NavigateToJourneyAction | SignUpBlockCreate_signUpBlockCreate_action_LinkAction;

export interface SignUpBlockCreate_signUpBlockCreate {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  journeyId: string;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string;
  action: SignUpBlockCreate_signUpBlockCreate_action | null;
}

export interface SignUpBlockCreate_submitIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface SignUpBlockCreate {
  signUpBlockCreate: SignUpBlockCreate_signUpBlockCreate;
  submitIcon: SignUpBlockCreate_submitIcon;
}

export interface SignUpBlockCreateVariables {
  input: SignUpBlockCreateInput;
  iconBlockCreateInput: IconBlockCreateInput;
}
