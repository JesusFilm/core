/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: RadioOptionFields
// ====================================================

export interface RadioOptionFields_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface RadioOptionFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface RadioOptionFields_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface RadioOptionFields_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journey: RadioOptionFields_action_NavigateToJourneyAction_journey | null;
}

export interface RadioOptionFields_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type RadioOptionFields_action = RadioOptionFields_action_NavigateAction | RadioOptionFields_action_NavigateToBlockAction | RadioOptionFields_action_NavigateToJourneyAction | RadioOptionFields_action_LinkAction;

export interface RadioOptionFields {
  __typename: "RadioOptionBlock";
  id: string;
  journeyId: string;
  parentBlockId: string | null;
  label: string;
  action: RadioOptionFields_action | null;
}
