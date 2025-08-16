/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonAction, VideoBlockSource, MessagePlatform } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVisitorEvents
// ====================================================

export interface GetVisitorEvents_visitor_events_JourneyEvent {
  __typename: "JourneyEvent" | "RadioQuestionSubmissionEvent" | "StepViewEvent" | "StepNextEvent" | "StepPreviousEvent" | "TextResponseSubmissionEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
}

export interface GetVisitorEvents_visitor_events_ButtonClickEvent {
  __typename: "ButtonClickEvent";
  id: string | null;
  /**
   * ID of the journey that the buttonBlock belongs to
   */
  journeyId: string | null;
  /**
   * stepName of the parent stepBlock
   */
  label: string | null;
  /**
   * label of the button
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * Action type of the button when it was clicked
   */
  action: ButtonAction | null;
  /**
   * The label for each corresponding action, mapping below:
   * NavigateToBlockAction - StepName (generated in client) of the StepBlock
   * LinkAction - url of the link
   */
  actionValue: string | null;
}

export interface GetVisitorEvents_visitor_events_JourneyViewEvent_language_name {
  __typename: "LanguageName";
  value: string;
}

export interface GetVisitorEvents_visitor_events_JourneyViewEvent_language {
  __typename: "Language";
  id: string;
  name: GetVisitorEvents_visitor_events_JourneyViewEvent_language_name[];
}

export interface GetVisitorEvents_visitor_events_JourneyViewEvent {
  __typename: "JourneyViewEvent";
  id: string | null;
  /**
   * ID of the journey being viewed
   */
  journeyId: string | null;
  /**
   * title of the journey being viewed
   */
  label: string | null;
  /**
   * languageId of the journey being viewed
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * language of the journey being viewed (based on the ID in the value field)
   */
  language: GetVisitorEvents_visitor_events_JourneyViewEvent_language | null;
}

export interface GetVisitorEvents_visitor_events_SignUpSubmissionEvent {
  __typename: "SignUpSubmissionEvent";
  id: string | null;
  /**
   * ID of the journey that the block belongs to
   */
  journeyId: string | null;
  /**
   * null for signUpSubmissionEvent
   */
  label: string | null;
  /**
   * name from the signUpBlock form
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * email from the signUpBlock form
   */
  email: string | null;
}

export interface GetVisitorEvents_visitor_events_VideoStartEvent {
  __typename: "VideoStartEvent";
  id: string | null;
  /**
   * ID of the journey that the videoBlock belongs to
   */
  journeyId: string | null;
  /**
   * title of the video
   */
  label: string | null;
  /**
   * source of the video
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * source of the video (based on the source in the value field)
   */
  source: VideoBlockSource | null;
  /**
   * duration of the video played when the VideoStartEvent is triggered
   */
  position: number | null;
}

export interface GetVisitorEvents_visitor_events_VideoCompleteEvent {
  __typename: "VideoCompleteEvent";
  id: string | null;
  /**
   * ID of the journey that the videoBlock belongs to
   */
  journeyId: string | null;
  /**
   * title of the video
   */
  label: string | null;
  /**
   * source of the video
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * source of the video (based on the source in the value field)
   */
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_ChatOpenEvent {
  __typename: "ChatOpenEvent";
  id: string | null;
  /**
   * ID of the journey that the buttonBlock belongs to
   */
  journeyId: string | null;
  /**
   * null for ChatOpenEvent
   */
  label: string | null;
  /**
   * messagePlatform of the link used for chat
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * messagePlatform of the link used for chat (based on the messagePlatform in the value field)
   */
  messagePlatform: MessagePlatform | null;
}

export interface GetVisitorEvents_visitor_events_VideoCollapseEvent {
  __typename: "VideoCollapseEvent";
  id: string | null;
  /**
   * ID of the journey that the videoBlock belongs to
   */
  journeyId: string | null;
  /**
   * title of the video
   */
  label: string | null;
  /**
   * source of the video
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * duration of the video played when the VideoCollapseEvent is triggered
   */
  position: number | null;
  /**
   * source of the video (based on the source in the value field)
   */
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoExpandEvent {
  __typename: "VideoExpandEvent";
  id: string | null;
  /**
   * ID of the journey that the videoBlock belongs to
   */
  journeyId: string | null;
  /**
   * title of the video
   */
  label: string | null;
  /**
   * source of the video
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * duration of the video played when the VideoExpandEvent is triggered
   */
  position: number | null;
  /**
   * source of the video (based on the source in the value field)
   */
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoPauseEvent {
  __typename: "VideoPauseEvent";
  id: string | null;
  /**
   * ID of the journey that the videoBlock belongs to
   */
  journeyId: string | null;
  /**
   * title of the video
   */
  label: string | null;
  /**
   * source of the video
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * duration of the video played when the VideoPauseEvent is triggered
   */
  position: number | null;
  /**
   * source of the video (based on the source in the value field)
   */
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoPlayEvent {
  __typename: "VideoPlayEvent";
  id: string | null;
  /**
   * ID of the journey that the videoBlock belongs to
   */
  journeyId: string | null;
  /**
   * title of the video
   */
  label: string | null;
  /**
   * source of the video
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * duration of the video played when the VideoPlayEvent is triggered
   */
  position: number | null;
  /**
   * source of the video (based on the source in the value field)
   */
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoProgressEvent {
  __typename: "VideoProgressEvent";
  id: string | null;
  /**
   * ID of the journey that the videoBlock belongs to
   */
  journeyId: string | null;
  /**
   * title of the video
   */
  label: string | null;
  /**
   * source of the video
   */
  value: string | null;
  /**
   * time event was created
   */
  createdAt: any | null;
  /**
   * duration of the video played when the VideoProgressEvent is triggered
   */
  position: number | null;
  /**
   * source of the video (based on the source in the value field)
   */
  source: VideoBlockSource | null;
  /**
   * progress is a integer indicating the precentage completion from the startAt to the endAt times of the videoBlock
   */
  progress: number | null;
}

export type GetVisitorEvents_visitor_events = GetVisitorEvents_visitor_events_JourneyEvent | GetVisitorEvents_visitor_events_ButtonClickEvent | GetVisitorEvents_visitor_events_JourneyViewEvent | GetVisitorEvents_visitor_events_SignUpSubmissionEvent | GetVisitorEvents_visitor_events_VideoStartEvent | GetVisitorEvents_visitor_events_VideoCompleteEvent | GetVisitorEvents_visitor_events_ChatOpenEvent | GetVisitorEvents_visitor_events_VideoCollapseEvent | GetVisitorEvents_visitor_events_VideoExpandEvent | GetVisitorEvents_visitor_events_VideoPauseEvent | GetVisitorEvents_visitor_events_VideoPlayEvent | GetVisitorEvents_visitor_events_VideoProgressEvent;

export interface GetVisitorEvents_visitor {
  __typename: "Visitor";
  id: string;
  events: GetVisitorEvents_visitor_events[];
}

export interface GetVisitorEvents {
  /**
   * Get a single visitor
   */
  visitor: GetVisitorEvents_visitor;
}

export interface GetVisitorEventsVariables {
  id: string;
}
