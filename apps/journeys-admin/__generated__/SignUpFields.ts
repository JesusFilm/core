/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SignUpFields
// ====================================================

export interface SignUpFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface SignUpFields_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface SignUpFields_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface SignUpFields_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
}

export type SignUpFields_action = SignUpFields_action_NavigateToBlockAction | SignUpFields_action_LinkAction | SignUpFields_action_EmailAction | SignUpFields_action_PhoneAction;

export interface SignUpFields {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: SignUpFields_action | null;
}
