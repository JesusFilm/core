/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SignUpBlockCreateInput, IconBlockCreateInput, SignUpBlockUpdateInput, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SignUpBlockCreate
// ====================================================

export interface SignUpBlockCreate_signUpBlockCreate_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface SignUpBlockCreate_signUpBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface SignUpBlockCreate_signUpBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface SignUpBlockCreate_signUpBlockCreate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type SignUpBlockCreate_signUpBlockCreate_action = SignUpBlockCreate_signUpBlockCreate_action_PhoneAction | SignUpBlockCreate_signUpBlockCreate_action_NavigateToBlockAction | SignUpBlockCreate_signUpBlockCreate_action_LinkAction | SignUpBlockCreate_signUpBlockCreate_action_EmailAction;

export interface SignUpBlockCreate_signUpBlockCreate {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: SignUpBlockCreate_signUpBlockCreate_action | null;
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

export interface SignUpBlockCreate_signUpBlockUpdate_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface SignUpBlockCreate_signUpBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export type SignUpBlockCreate_signUpBlockUpdate_action = SignUpBlockCreate_signUpBlockUpdate_action_PhoneAction | SignUpBlockCreate_signUpBlockUpdate_action_NavigateToBlockAction | SignUpBlockCreate_signUpBlockUpdate_action_LinkAction | SignUpBlockCreate_signUpBlockUpdate_action_EmailAction;

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
