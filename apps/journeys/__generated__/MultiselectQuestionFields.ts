/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: MultiselectQuestionFields
// ====================================================

export interface MultiselectQuestionFields_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  target: string | null;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface MultiselectQuestionFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MultiselectQuestionFields_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface MultiselectQuestionFields_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type MultiselectQuestionFields_action = MultiselectQuestionFields_action_LinkAction | MultiselectQuestionFields_action_NavigateToBlockAction | MultiselectQuestionFields_action_EmailAction | MultiselectQuestionFields_action_PhoneAction;

export interface MultiselectQuestionFields {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  min: number | null;
  max: number | null;
  action: MultiselectQuestionFields_action | null;
}
