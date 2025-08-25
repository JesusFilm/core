/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonAction, VideoBlockSource, MessagePlatform } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVisitorEvents
// ====================================================

export interface GetVisitorEvents_visitor_events_JourneyEvent {
  __typename: "JourneyEvent" | "StepViewEvent" | "StepNextEvent" | "StepPreviousEvent" | "RadioQuestionSubmissionEvent" | "TextResponseSubmissionEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
}

export interface GetVisitorEvents_visitor_events_ButtonClickEvent {
  __typename: "ButtonClickEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  action: ButtonAction | null;
  actionValue: string | null;
}

export interface GetVisitorEvents_visitor_events_JourneyViewEvent {
  __typename: "JourneyViewEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  language: any | null;
}

export interface GetVisitorEvents_visitor_events_SignUpSubmissionEvent {
  __typename: "SignUpSubmissionEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  email: string | null;
}

export interface GetVisitorEvents_visitor_events_VideoStartEvent {
  __typename: "VideoStartEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  source: VideoBlockSource | null;
  position: number | null;
}

export interface GetVisitorEvents_visitor_events_VideoCompleteEvent {
  __typename: "VideoCompleteEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_ChatOpenEvent {
  __typename: "ChatOpenEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  messagePlatform: MessagePlatform | null;
}

export interface GetVisitorEvents_visitor_events_VideoCollapseEvent {
  __typename: "VideoCollapseEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  position: number | null;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoExpandEvent {
  __typename: "VideoExpandEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  position: number | null;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoPauseEvent {
  __typename: "VideoPauseEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  position: number | null;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoPlayEvent {
  __typename: "VideoPlayEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  position: number | null;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoProgressEvent {
  __typename: "VideoProgressEvent";
  id: string | null;
  journeyId: string | null;
  label: string | null;
  value: string | null;
  createdAt: any | null;
  position: number | null;
  source: VideoBlockSource | null;
  progress: number | null;
}

export type GetVisitorEvents_visitor_events = GetVisitorEvents_visitor_events_JourneyEvent | GetVisitorEvents_visitor_events_ButtonClickEvent | GetVisitorEvents_visitor_events_JourneyViewEvent | GetVisitorEvents_visitor_events_SignUpSubmissionEvent | GetVisitorEvents_visitor_events_VideoStartEvent | GetVisitorEvents_visitor_events_VideoCompleteEvent | GetVisitorEvents_visitor_events_ChatOpenEvent | GetVisitorEvents_visitor_events_VideoCollapseEvent | GetVisitorEvents_visitor_events_VideoExpandEvent | GetVisitorEvents_visitor_events_VideoPauseEvent | GetVisitorEvents_visitor_events_VideoPlayEvent | GetVisitorEvents_visitor_events_VideoProgressEvent;

export interface GetVisitorEvents_visitor {
  __typename: "Visitor";
  id: string | null;
  events: GetVisitorEvents_visitor_events[] | null;
}

export interface GetVisitorEvents {
  visitor: GetVisitorEvents_visitor | null;
}

export interface GetVisitorEventsVariables {
  id: string;
}
