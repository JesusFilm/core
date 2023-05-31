/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ActionFields
// ====================================================

export interface ActionFields_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface ActionFields_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface ActionFields_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface ActionFields_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: ActionFields_NavigateToJourneyAction_journey_language;
}

export interface ActionFields_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: ActionFields_NavigateToJourneyAction_journey | null;
}

export interface ActionFields_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface ActionFields_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type ActionFields = ActionFields_NavigateAction | ActionFields_NavigateToBlockAction | ActionFields_NavigateToJourneyAction | ActionFields_LinkAction | ActionFields_EmailAction;
