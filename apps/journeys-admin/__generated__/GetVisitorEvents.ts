/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVisitorEvents
// ====================================================

export interface GetVisitorEvents_visitor_events_ButtonClickEvent {
  __typename: "ButtonClickEvent" | "RadioQuestionSubmissionEvent" | "StepViewEvent" | "TextResponseSubmissionEvent" | "VideoCollapseEvent" | "VideoCompleteEvent" | "VideoExpandEvent" | "VideoPauseEvent" | "VideoPlayEvent" | "VideoProgressEvent" | "VideoStartEvent";
  id: string;
  journeyId: string;
  label: string | null;
  value: string | null;
  createdAt: any;
}

export interface GetVisitorEvents_visitor_events_JourneyViewEvent_language_name {
  __typename: "Translation";
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

export type GetVisitorEvents_visitor_events = GetVisitorEvents_visitor_events_ButtonClickEvent | GetVisitorEvents_visitor_events_JourneyViewEvent | GetVisitorEvents_visitor_events_SignUpSubmissionEvent;

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
