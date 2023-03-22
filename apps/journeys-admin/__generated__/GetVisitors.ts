/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MessagePlatform } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVisitors
// ====================================================

export interface GetVisitors_visitors_edges_node_events_JourneyViewEvent {
  __typename: "JourneyViewEvent" | "SignUpSubmissionEvent" | "StepViewEvent" | "StepNextEvent" | "VideoStartEvent" | "VideoPlayEvent" | "VideoPauseEvent" | "VideoCompleteEvent" | "VideoExpandEvent" | "VideoCollapseEvent" | "VideoProgressEvent";
}

export interface GetVisitors_visitors_edges_node_events_ChatOpenEvent {
  __typename: "ChatOpenEvent";
  id: string;
  /**
   * ID of the journey that the buttonBlock belongs to
   */
  journeyId: string;
  /**
   * time event was created
   */
  createdAt: any;
  /**
   * null for ChatOpenEvent
   */
  label: string | null;
  /**
   * messagePlatform of the link used for chat
   */
  value: string | null;
  /**
   * messagePlatform of the link used for chat (based on the messagePlatform in the value field)
   */
  messagePlatform: MessagePlatform | null;
}

export interface GetVisitors_visitors_edges_node_events_TextResponseSubmissionEvent {
  __typename: "TextResponseSubmissionEvent";
  id: string;
  /**
   * ID of the journey that the buttonBlock belongs to
   */
  journeyId: string;
  /**
   * time event was created
   */
  createdAt: any;
  /**
   * stepName of the parent stepBlock
   */
  label: string | null;
  /**
   * response from the TextResponseBlock form
   */
  value: string | null;
}

export interface GetVisitors_visitors_edges_node_events_RadioQuestionSubmissionEvent {
  __typename: "RadioQuestionSubmissionEvent";
  id: string;
  /**
   * ID of the journey that the radioQuestionBlock belongs to
   */
  journeyId: string;
  /**
   * time event was created
   */
  createdAt: any;
  /**
   * stepName of the parent stepBlock
   */
  label: string | null;
  /**
   * label of the selected radioOptionBlock
   */
  value: string | null;
}

export interface GetVisitors_visitors_edges_node_events_ButtonClickEvent {
  __typename: "ButtonClickEvent";
  id: string;
  /**
   * ID of the journey that the buttonBlock belongs to
   */
  journeyId: string;
  /**
   * time event was created
   */
  createdAt: any;
  /**
   * stepName of the parent stepBlock
   */
  label: string | null;
  /**
   * label of the button
   */
  value: string | null;
}

export type GetVisitors_visitors_edges_node_events = GetVisitors_visitors_edges_node_events_JourneyViewEvent | GetVisitors_visitors_edges_node_events_ChatOpenEvent | GetVisitors_visitors_edges_node_events_TextResponseSubmissionEvent | GetVisitors_visitors_edges_node_events_RadioQuestionSubmissionEvent | GetVisitors_visitors_edges_node_events_ButtonClickEvent;

export interface GetVisitors_visitors_edges_node {
  __typename: "Visitor";
  id: string;
  /**
   * The time when the visitor created their first event on a journey connected
   * to the requested team.
   */
  createdAt: any;
  events: GetVisitors_visitors_edges_node_events[];
}

export interface GetVisitors_visitors_edges {
  __typename: "VisitorEdge";
  /**
   * The item at the end of the edge.
   */
  node: GetVisitors_visitors_edges_node;
}

export interface GetVisitors_visitors {
  __typename: "VisitorsConnection";
  /**
   * A list of edges.
   */
  edges: GetVisitors_visitors_edges[];
}

export interface GetVisitors {
  /**
   * A list of visitors that are connected with a specific team.
   */
  visitors: GetVisitors_visitors;
}
