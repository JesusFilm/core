/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MessagePlatform } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVisitors
// ====================================================

export interface GetVisitors_visitors_edges_node {
  __typename: "Visitor";
  id: string | null;
  lastChatPlatform: MessagePlatform | null;
  lastStepViewedAt: any | null;
  lastLinkAction: string | null;
  lastTextResponse: string | null;
  lastRadioQuestion: string | null;
  lastRadioOptionSubmission: string | null;
}

export interface GetVisitors_visitors_edges {
  __typename: "QueryVisitorsConnectionEdge";
  node: GetVisitors_visitors_edges_node | null;
  cursor: string;
}

export interface GetVisitors_visitors_pageInfo {
  __typename: "PageInfo";
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface GetVisitors_visitors {
  __typename: "QueryVisitorsConnection";
  edges: (GetVisitors_visitors_edges | null)[] | null;
  pageInfo: GetVisitors_visitors_pageInfo;
}

export interface GetVisitors {
  visitors: GetVisitors_visitors | null;
}

export interface GetVisitorsVariables {
  first?: number | null;
  after?: string | null;
}
