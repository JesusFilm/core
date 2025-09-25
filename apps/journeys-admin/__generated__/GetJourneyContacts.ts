/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyEventsFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyContacts
// ====================================================

export interface GetJourneyContacts_journeyEventsConnection_edges_node {
  __typename: "JourneyEvent";
  visitorId: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  createdAt: any;
}

export interface GetJourneyContacts_journeyEventsConnection_edges {
  __typename: "JourneyEventEdge";
  cursor: string;
  node: GetJourneyContacts_journeyEventsConnection_edges_node;
}

export interface GetJourneyContacts_journeyEventsConnection_pageInfo {
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

export interface GetJourneyContacts_journeyEventsConnection {
  __typename: "JourneyEventsConnection";
  edges: GetJourneyContacts_journeyEventsConnection_edges[];
  pageInfo: GetJourneyContacts_journeyEventsConnection_pageInfo;
}

export interface GetJourneyContacts {
  journeyEventsConnection: GetJourneyContacts_journeyEventsConnection;
}

export interface GetJourneyContactsVariables {
  journeyId: string;
  filter?: JourneyEventsFilter | null;
  first?: number | null;
  after?: string | null;
}
