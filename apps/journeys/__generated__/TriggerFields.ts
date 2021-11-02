/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: TriggerFields
// ====================================================

export interface TriggerFields_triggerAction_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface TriggerFields_triggerAction_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface TriggerFields_triggerAction_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journeyId: string;
}

export interface TriggerFields_triggerAction_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type TriggerFields_triggerAction = TriggerFields_triggerAction_NavigateAction | TriggerFields_triggerAction_NavigateToBlockAction | TriggerFields_triggerAction_NavigateToJourneyAction | TriggerFields_triggerAction_LinkAction;

export interface TriggerFields {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  triggerAction: TriggerFields_triggerAction;
}
