/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyVisitorFilter, JourneyVisitorSort, VisitorStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyVisitors
// ====================================================

export interface GetJourneyVisitors_visitors_edges_node_visitor {
  __typename: "Visitor";
  /**
   * The name of the visitor as populated by VisitorUpdate mutation or
   * SignUpEventSubmissionEventCreate mutation.
   */
  name: string | null;
  /**
   * Status of the visitor as populated by VisitorUpdate mutation.
   */
  status: VisitorStatus | null;
  /**
   * The country code of the visitor as poulated by visitor ip address detected in
   * the JourneyViewEventCreate mutation. This field country code is converted
   * from an IP address by the @maxmind/geoip2-node library. If this field is empty
   * it is likely that the JourneyViewEventCreate mutation was not called by the
   * visitor or that the country was not able to be determined based on the
   * visitor IP address.
   */
  countryCode: string | null;
  /**
   * The url visitor was referred from
   */
  referrer: string | null;
}

export interface GetJourneyVisitors_visitors_edges_node_events_JourneyEvent {
  __typename: "JourneyEvent" | "ButtonClickEvent" | "ChatOpenEvent" | "JourneyViewEvent" | "RadioQuestionSubmissionEvent" | "SignUpSubmissionEvent" | "StepViewEvent" | "StepNextEvent" | "StepPreviousEvent" | "VideoStartEvent" | "VideoPlayEvent" | "VideoPauseEvent" | "VideoCompleteEvent" | "VideoExpandEvent" | "VideoCollapseEvent" | "VideoProgressEvent";
  id: string;
  createdAt: any;
  label: string | null;
  value: string | null;
}

export interface GetJourneyVisitors_visitors_edges_node_events_TextResponseSubmissionEvent {
  __typename: "TextResponseSubmissionEvent";
  id: string;
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
  /**
   * the id of the block this event originates from
   */
  blockId: string | null;
}

export type GetJourneyVisitors_visitors_edges_node_events = GetJourneyVisitors_visitors_edges_node_events_JourneyEvent | GetJourneyVisitors_visitors_edges_node_events_TextResponseSubmissionEvent;

export interface GetJourneyVisitors_visitors_edges_node {
  __typename: "JourneyVisitor";
  visitorId: string;
  /**
   * The time when the visitor created their first event on a journey connected
   * to the requested team.
   */
  createdAt: any;
  /**
   * Duration between createdAt and lastStepViewedAt in seconds
   */
  duration: number | null;
  visitor: GetJourneyVisitors_visitors_edges_node_visitor;
  events: GetJourneyVisitors_visitors_edges_node_events[];
}

export interface GetJourneyVisitors_visitors_edges {
  __typename: "JourneyVisitorEdge";
  /**
   * A cursor for use in pagination.
   */
  cursor: string;
  /**
   * The item at the end of the edge.
   */
  node: GetJourneyVisitors_visitors_edges_node;
}

export interface GetJourneyVisitors_visitors_pageInfo {
  __typename: "PageInfo";
  /**
   * When paginating forwards, are there more items?
   */
  hasNextPage: boolean;
  /**
   * When paginating backwards, the cursor to continue.
   */
  startCursor: string | null;
  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor: string | null;
}

export interface GetJourneyVisitors_visitors {
  __typename: "JourneyVisitorsConnection";
  /**
   * A list of edges.
   */
  edges: GetJourneyVisitors_visitors_edges[];
  /**
   * Information to aid in pagination.
   */
  pageInfo: GetJourneyVisitors_visitors_pageInfo;
}

export interface GetJourneyVisitors {
  /**
   * Get a list of Visitor Information by Journey
   */
  visitors: GetJourneyVisitors_visitors;
}

export interface GetJourneyVisitorsVariables {
  filter: JourneyVisitorFilter;
  sort?: JourneyVisitorSort | null;
  first?: number | null;
  after?: string | null;
}
