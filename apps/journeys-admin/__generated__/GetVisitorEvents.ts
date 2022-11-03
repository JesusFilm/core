/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVisitorEvents
// ====================================================

export interface GetVisitorEvents_visitor_events_ButtonClickEvent {
  __typename: "ButtonClickEvent" | "ChatOpenedEvent" | "RadioQuestionSubmissionEvent" | "StepNextEvent" | "StepViewEvent" | "TextResponseSubmissionEvent" | "VideoCollapseEvent" | "VideoCompleteEvent" | "VideoExpandEvent" | "VideoPauseEvent" | "VideoPlayEvent" | "VideoProgressEvent" | "VideoStartEvent";
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
  /**
   * ID of the journey being viewed
   */
  journeyId: string;
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
  createdAt: any;
  /**
   * language of the journey being viewed (based on the ID in the value field)
   */
  language: GetVisitorEvents_visitor_events_JourneyViewEvent_language | null;
}

export interface GetVisitorEvents_visitor_events_SignUpSubmissionEvent {
  __typename: "SignUpSubmissionEvent";
  id: string;
  /**
   * ID of the journey that the block belongs to
   */
  journeyId: string;
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
  createdAt: any;
  /**
   * email from the signUpBlock form
   */
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
