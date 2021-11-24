/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ActionFields
// ====================================================

export interface ActionFields_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string;
}

export interface ActionFields_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string;
  blockId: string;
}

export interface ActionFields_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface ActionFields_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string;
  journey: ActionFields_NavigateToJourneyAction_journey;
}

export interface ActionFields_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string;
  url: string;
}

export type ActionFields = ActionFields_NavigateAction | ActionFields_NavigateToBlockAction | ActionFields_NavigateToJourneyAction | ActionFields_LinkAction;
