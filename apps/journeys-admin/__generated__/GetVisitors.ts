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
}

export interface GetVisitors_visitors {
  __typename: "VisitorsConnection";
  /**
   * A list of edges.
   */
  edges: GetVisitors_visitors_edges[];
}

export interface GetVisitors {
  /**
   * A list of visitors that are connected with a specific team.
   */
  visitors: GetVisitors_visitors;
}
