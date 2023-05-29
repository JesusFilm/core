/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SignUpBlockCreateInput, IconBlockCreateInput, SignUpBlockUpdateInput, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SignUpBlockCreate
// ====================================================

export interface SignUpBlockCreate_signUpBlockCreate {
  __typename: "SignUpBlock";
  id: string;
}

export interface SignUpBlockCreate_submitIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: SignUpBlockCreate_signUpBlockUpdate_action_NavigateToJourneyAction_journey_language;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: SignUpBlockCreate_signUpBlockUpdate_action_NavigateToJourneyAction_journey | null;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type SignUpBlockCreate_signUpBlockUpdate_action = SignUpBlockCreate_signUpBlockUpdate_action_NavigateAction | SignUpBlockCreate_signUpBlockUpdate_action_NavigateToBlockAction | SignUpBlockCreate_signUpBlockUpdate_action_NavigateToJourneyAction | SignUpBlockCreate_signUpBlockUpdate_action_LinkAction | SignUpBlockCreate_signUpBlockUpdate_action_EmailAction;

export interface SignUpBlockCreate_signUpBlockUpdate {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: SignUpBlockCreate_signUpBlockUpdate_action | null;
}

export interface SignUpBlockCreate {
  signUpBlockCreate: SignUpBlockCreate_signUpBlockCreate;
  submitIcon: SignUpBlockCreate_submitIcon;
  signUpBlockUpdate: SignUpBlockCreate_signUpBlockUpdate | null;
}

export interface SignUpBlockCreateVariables {
  input: SignUpBlockCreateInput;
  iconBlockCreateInput: IconBlockCreateInput;
  id: string;
  journeyId: string;
  updateInput: SignUpBlockUpdateInput;
}
