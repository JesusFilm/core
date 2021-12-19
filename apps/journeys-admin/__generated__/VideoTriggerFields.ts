/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: VideoTriggerFields
// ====================================================

export interface VideoTriggerFields_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface VideoTriggerFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface VideoTriggerFields_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
}

export interface VideoTriggerFields_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journey: VideoTriggerFields_action_NavigateToJourneyAction_journey | null;
}

export interface VideoTriggerFields_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type VideoTriggerFields_action = VideoTriggerFields_action_NavigateAction | VideoTriggerFields_action_NavigateToBlockAction | VideoTriggerFields_action_NavigateToJourneyAction | VideoTriggerFields_action_LinkAction;

export interface VideoTriggerFields {
  __typename: "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  /**
   * triggerStart sets the time as to when a video navigates to the next block,
   * this is the number of seconds since the start of the video
   */
  triggerStart: number;
  action: VideoTriggerFields_action | null;
}
