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
  id: string;
  lastChatPlatform: MessagePlatform | null;
  lastStepViewedAt: any | null;
  lastLinkAction: string | null;
  lastTextResponse: string | null;
  lastRadioQuestion: string | null;
  lastRadioOptionSubmission: string | null;
}

export interface GetVisitors_visitors_edges {
  __typename: "VisitorEdge";
  node: GetVisitors_visitors_edges_node;
  cursor: string;
}

export interface GetVisitors_visitors_pageInfo {
  __typename: "PageInfo";
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface GetVisitors_visitors {
  __typename: "VisitorsConnection";
  edges: GetVisitors_visitors_edges[];
  pageInfo: GetVisitors_visitors_pageInfo;
}

export interface GetVisitors {
  visitors: GetVisitors_visitors;
}

export interface GetVisitorsVariables {
  first?: number | null;
  after?: string | null;
}
