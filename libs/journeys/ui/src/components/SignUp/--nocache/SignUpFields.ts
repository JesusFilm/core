/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SignUpFields
// ====================================================

export interface SignUpFields_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface SignUpFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface SignUpFields_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface SignUpFields_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: SignUpFields_action_NavigateToJourneyAction_journey_language;
}

export interface SignUpFields_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: SignUpFields_action_NavigateToJourneyAction_journey | null;
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

export type SignUpFields_action = SignUpFields_action_NavigateAction | SignUpFields_action_NavigateToBlockAction | SignUpFields_action_NavigateToJourneyAction | SignUpFields_action_LinkAction | SignUpFields_action_EmailAction;

export interface SignUpFields {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: SignUpFields_action | null;
}
