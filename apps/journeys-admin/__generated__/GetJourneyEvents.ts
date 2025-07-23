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
  journeyId: string | null;
  visitorId: string | null;
  label: string | null;
  value: string | null;
  typename: string | null;
  progress: number | null;
  journeySlug: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  createdAt: any | null;
}

export interface GetJourneyEvents_journeyEventsConnection_edges {
  __typename: "QueryJourneyEventsConnectionEdge";
  cursor: string;
  node: GetJourneyEvents_journeyEventsConnection_edges_node | null;
}

export interface GetJourneyEvents_journeyEventsConnection_pageInfo {
  __typename: "PageInfo";
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
}

export interface GetJourneyEvents_journeyEventsConnection {
  __typename: "QueryJourneyEventsConnection";
  edges: (GetJourneyEvents_journeyEventsConnection_edges | null)[] | null;
  pageInfo: GetJourneyEvents_journeyEventsConnection_pageInfo;
}

export interface GetJourneyEvents {
  journeyEventsConnection: GetJourneyEvents_journeyEventsConnection | null;
}

export interface GetJourneyEventsVariables {
  journeyId: string;
  filter?: JourneyEventsFilter | null;
  first?: number | null;
  after?: string | null;
}
