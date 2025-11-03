/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyEventsFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyEvents
// ====================================================

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
  journeySlug: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  createdAt: any;
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
