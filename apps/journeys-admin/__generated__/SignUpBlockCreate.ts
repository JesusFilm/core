/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SignUpBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SignUpBlockCreate
// ====================================================

export interface SignUpBlockCreate_signUpBlockCreate_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface SignUpBlockCreate_signUpBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
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
  gtmEventName: string | null;
  journey: SignUpBlockCreate_signUpBlockCreate_action_NavigateToJourneyAction_journey | null;
}

export interface SignUpBlockCreate_signUpBlockCreate_action_LinkAction {
  __typename: "LinkAction";
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
  submitIconId: string | null;
  action: SignUpBlockCreate_signUpBlockCreate_action | null;
}

export interface SignUpBlockCreate {
  signUpBlockCreate: SignUpBlockCreate_signUpBlockCreate;
}

export interface SignUpBlockCreateVariables {
  input: SignUpBlockCreateInput;
}
