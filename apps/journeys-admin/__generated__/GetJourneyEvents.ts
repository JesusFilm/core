/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyEventsFilter, ButtonAction, MessagePlatform, VideoBlockSource } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyEvents
// ====================================================

export interface GetJourneyEvents_journeyEventsConnection_edges_node_language_name {
  __typename: "LanguageName";
  value: string;
}

export interface GetJourneyEvents_journeyEventsConnection_edges_node_language {
  __typename: "Language";
  id: string;
  name: GetJourneyEvents_journeyEventsConnection_edges_node_language_name[];
}

export interface GetJourneyEvents_journeyEventsConnection_edges_node_journey {
  __typename: "Journey";
  /**
   * private title for creators
   */
  title: string;
  slug: string;
}

export interface GetJourneyEvents_journeyEventsConnection_edges_node_visitor {
  __typename: "Visitor";
  /**
   * The name of the visitor as populated by VisitorUpdate mutation or
   * SignUpEventSubmissionEventCreate mutation.
   */
  name: string | null;
  /**
   * The email address of the visitor as populated by VisitorUpdate mutation or
   * SignUpEventSubmissionEventCreate mutation.
   */
  email: string | null;
}

export interface GetJourneyEvents_journeyEventsConnection_edges_node {
  __typename: "JourneyEvent";
  /**
   * Base event fields from Event interface
   */
  id: string;
  journeyId: string;
  createdAt: any;
  label: string | null;
  value: string | null;
  /**
   * Additional specific event fields
   */
  action: ButtonAction | null;
  actionValue: string | null;
  messagePlatform: MessagePlatform | null;
  language: GetJourneyEvents_journeyEventsConnection_edges_node_language | null;
  email: string | null;
  blockId: string | null;
  position: number | null;
  source: VideoBlockSource | null;
  progress: number | null;
  /**
   * database fields from table, not explicitly surfaced from any other types
   */
  typename: string | null;
  visitorId: string | null;
  /**
   * Related fields queried from relevant ids in the events table
   */
  journey: GetJourneyEvents_journeyEventsConnection_edges_node_journey | null;
  visitor: GetJourneyEvents_journeyEventsConnection_edges_node_visitor | null;
}

export interface GetJourneyEvents_journeyEventsConnection_edges {
  __typename: "JourneyEventEdge";
  node: GetJourneyEvents_journeyEventsConnection_edges_node;
}

export interface GetJourneyEvents_journeyEventsConnection_pageInfo {
  __typename: "PageInfo";
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
  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor: string | null;
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
