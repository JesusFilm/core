/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVisitors
// ====================================================

export interface GetVisitors_visitors_edges_node {
  __typename: "Visitor";
  id: string;
  /**
   * The time when the visitor created their first event on a journey connected
   * to the requested team.
   */
  createdAt: any;
}

export interface GetVisitors_visitors_edges {
  __typename: "VisitorEdge";
  /**
   * The item at the end of the edge.
   */
  node: GetVisitors_visitors_edges_node;
  /**
   * A cursor for use in pagination.
   */
  cursor: string;
}

export interface GetVisitors_visitors_pageInfo {
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

export interface GetVisitors_visitors {
  __typename: "VisitorsConnection";
  /**
   * A list of edges.
   */
  edges: GetVisitors_visitors_edges[];
  /**
   * Information to aid in pagination.
   */
  pageInfo: GetVisitors_visitors_pageInfo;
}

export interface GetVisitors {
  /**
   * A list of visitors that are connected with a specific team.
   */
  visitors: GetVisitors_visitors;
}

export interface GetVisitorsVariables {
  first?: number | null;
  after?: string | null;
}
