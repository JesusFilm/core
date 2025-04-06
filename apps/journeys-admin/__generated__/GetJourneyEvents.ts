/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyEventsFilter, ButtonAction, MessagePlatform, VideoBlockSource } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyEvents
// ====================================================

export interface GetJourneyEvents_journeyEventsConnection_edges_node_journey {
  __typename: "Journey";
  slug: string;
}

export interface GetJourneyEvents_journeyEventsConnection_edges_node_visitor {
  __typename: "Visitor";
  /**
   * The email address of the visitor as populated by VisitorUpdate mutation or
   * SignUpEventSubmissionEventCreate mutation.
   */
  email: string | null;
  /**
   * The name of the visitor as populated by VisitorUpdate mutation or
   * SignUpEventSubmissionEventCreate mutation.
   */
  name: string | null;
}

export interface GetJourneyEvents_journeyEventsConnection_edges_node {
  __typename: "JourneyEvent";
  journeyId: string;
  visitorId: string | null;
  label: string | null;
  value: string | null;
  /**
   * database fields from table, not explicitly surfaced from any other types
   */
  typename: string | null;
  progress: number | null;
  /**
   * Related fields queried from relevant ids in the events table
   */
  journey: GetJourneyEvents_journeyEventsConnection_edges_node_journey | null;
  visitor: GetJourneyEvents_journeyEventsConnection_edges_node_visitor | null;
}

export interface GetJourneyEvents_journeyEventsConnection_edges {
  __typename: "JourneyEventEdge";
  cursor: string;
  node: GetJourneyEvents_journeyEventsConnection_edges_node;
}

export interface GetJourneyEvents_journeyEventsConnection_pageInfo {
  __typename: "PageInfo";
  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor: string | null;
  /**
   * When paginating forwards, are there more items?
   */
  hasNextPage: boolean;
  /**
   * When paginating backwards, are there more items?
   */
  hasPreviousPage: boolean;
  /**
   * When paginating backwards, the cursor to continue.
   */
  startCursor: string | null;
}

export interface GetJourneyEvents_journeyEventsConnection {
  __typename: "JourneyEventsConnection";
  edges: GetJourneyEvents_journeyEventsConnection_edges[];
  pageInfo: GetJourneyEvents_journeyEventsConnection_pageInfo;
}

export interface GetJourneyEvents {
  journeyEventsConnection: GetJourneyEvents_journeyEventsConnection;
}

export interface GetJourneyEventsVariables {
  journeyId: string;
  filter?: JourneyEventsFilter | null;
  first?: number | null;
  after?: string | null;
}
