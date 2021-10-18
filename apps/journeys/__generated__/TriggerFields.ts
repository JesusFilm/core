/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: TriggerFields
// ====================================================

export interface TriggerFields_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface TriggerFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface TriggerFields_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journeyId: string;
}

export interface TriggerFields_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type TriggerFields_action = TriggerFields_action_NavigateAction | TriggerFields_action_NavigateToBlockAction | TriggerFields_action_NavigateToJourneyAction | TriggerFields_action_LinkAction;

export interface TriggerFields {
  __typename: "TriggerBlock";
  id: string;
  parentBlockId: string | null;
  triggerStart: number;
  action: TriggerFields_action;
}
