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
  name: string | null;
  status: VisitorStatus | null;
  countryCode: string | null;
  referrer: string | null;
}

export interface GetJourneyVisitors_visitors_edges_node_events_JourneyEvent {
  __typename: "JourneyEvent" | "ButtonClickEvent" | "ChatOpenEvent" | "JourneyViewEvent" | "StepViewEvent" | "StepNextEvent" | "StepPreviousEvent" | "RadioQuestionSubmissionEvent" | "SignUpSubmissionEvent" | "VideoStartEvent" | "VideoPlayEvent" | "VideoPauseEvent" | "VideoCompleteEvent" | "VideoExpandEvent" | "VideoCollapseEvent" | "VideoProgressEvent";
  id: string | null;
  createdAt: any | null;
  label: string | null;
  value: string | null;
}

export interface GetJourneyVisitors_visitors_edges_node_events_TextResponseSubmissionEvent {
  __typename: "TextResponseSubmissionEvent";
  id: string | null;
  createdAt: any | null;
  label: string | null;
  value: string | null;
  blockId: string | null;
}

export type GetJourneyVisitors_visitors_edges_node_events = GetJourneyVisitors_visitors_edges_node_events_JourneyEvent | GetJourneyVisitors_visitors_edges_node_events_TextResponseSubmissionEvent;

export interface GetJourneyVisitors_visitors_edges_node {
  __typename: "JourneyVisitor";
  visitorId: string | null;
  createdAt: any | null;
  duration: number | null;
  visitor: GetJourneyVisitors_visitors_edges_node_visitor | null;
  events: GetJourneyVisitors_visitors_edges_node_events[] | null;
}

export interface GetJourneyVisitors_visitors_edges {
  __typename: "QueryJourneyVisitorsConnectionEdge";
  cursor: string;
  node: GetJourneyVisitors_visitors_edges_node | null;
}

export interface GetJourneyVisitors_visitors_pageInfo {
  __typename: "PageInfo";
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface GetJourneyVisitors_visitors {
  __typename: "QueryJourneyVisitorsConnection";
  edges: (GetJourneyVisitors_visitors_edges | null)[] | null;
  pageInfo: GetJourneyVisitors_visitors_pageInfo;
}

export interface GetJourneyVisitors {
  visitors: GetJourneyVisitors_visitors | null;
}

export interface GetJourneyVisitorsVariables {
  filter: JourneyVisitorFilter;
  sort?: JourneyVisitorSort | null;
  first?: number | null;
  after?: string | null;
}
