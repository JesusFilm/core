/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonAction, VideoBlockSource, MessagePlatform } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVisitorEvents
// ====================================================

export interface GetVisitorEvents_visitor_events_JourneyEvent {
  __typename: "JourneyEvent" | "StepViewEvent" | "StepNextEvent" | "StepPreviousEvent" | "RadioQuestionSubmissionEvent" | "MultiselectSubmissionEvent" | "TextResponseSubmissionEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
}

export interface GetVisitorEvents_visitor_events_ButtonClickEvent {
  __typename: "ButtonClickEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  action: ButtonAction | null;
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
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  language: GetVisitorEvents_visitor_events_JourneyViewEvent_language | null;
}

export interface GetVisitorEvents_visitor_events_SignUpSubmissionEvent {
  __typename: "SignUpSubmissionEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  email: string | null;
}

export interface GetVisitorEvents_visitor_events_VideoStartEvent {
  __typename: "VideoStartEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  source: VideoBlockSource | null;
  position: number | null;
}

export interface GetVisitorEvents_visitor_events_VideoCompleteEvent {
  __typename: "VideoCompleteEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_ChatOpenEvent {
  __typename: "ChatOpenEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  messagePlatform: MessagePlatform | null;
}

export interface GetVisitorEvents_visitor_events_VideoCollapseEvent {
  __typename: "VideoCollapseEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  position: number | null;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoExpandEvent {
  __typename: "VideoExpandEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  position: number | null;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoPauseEvent {
  __typename: "VideoPauseEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  position: number | null;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoPlayEvent {
  __typename: "VideoPlayEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  position: number | null;
  source: VideoBlockSource | null;
}

export interface GetVisitorEvents_visitor_events_VideoProgressEvent {
  __typename: "VideoProgressEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
  position: number | null;
  source: VideoBlockSource | null;
  progress: number;
}

export type GetVisitorEvents_visitor_events = GetVisitorEvents_visitor_events_JourneyEvent | GetVisitorEvents_visitor_events_ButtonClickEvent | GetVisitorEvents_visitor_events_JourneyViewEvent | GetVisitorEvents_visitor_events_SignUpSubmissionEvent | GetVisitorEvents_visitor_events_VideoStartEvent | GetVisitorEvents_visitor_events_VideoCompleteEvent | GetVisitorEvents_visitor_events_ChatOpenEvent | GetVisitorEvents_visitor_events_VideoCollapseEvent | GetVisitorEvents_visitor_events_VideoExpandEvent | GetVisitorEvents_visitor_events_VideoPauseEvent | GetVisitorEvents_visitor_events_VideoPlayEvent | GetVisitorEvents_visitor_events_VideoProgressEvent;

export interface GetVisitorEvents_visitor {
  __typename: "Visitor";
  id: string;
  events: GetVisitorEvents_visitor_events[];
}

export interface GetVisitorEvents {
  visitor: GetVisitorEvents_visitor;
}

export interface GetVisitorEventsVariables {
  id: string;
}
