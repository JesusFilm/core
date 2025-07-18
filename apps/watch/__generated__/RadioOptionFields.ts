/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: RadioOptionFields
// ====================================================

export interface RadioOptionFields_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface RadioOptionFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface RadioOptionFields_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface RadioOptionFields_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type RadioOptionFields_action = RadioOptionFields_action_PhoneAction | RadioOptionFields_action_NavigateToBlockAction | RadioOptionFields_action_LinkAction | RadioOptionFields_action_EmailAction;

export interface RadioOptionFields {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: RadioOptionFields_action | null;
}
