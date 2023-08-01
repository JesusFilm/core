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
  /**
   * The last message platform the visitor called the ButtonClickEvent where the
   * url is in the format of a recognized chat platform
   */
  lastChatPlatform: MessagePlatform | null;
  /**
   * The last time the visitor called StepViewEvent mutation. It is populated when
   * the visitor is first created, and is updated by all event creation mutations.
   */
  lastStepViewedAt: any | null;
  /**
   * The label of a link action button of the last time the visitor clicked a
   * link action button. Populated by ButtonClickEvent
   */
  lastLinkAction: string | null;
  /**
   * The response of the last text response block the visitor filled out,
   * populated by TextResponseSubmission mutation
   */
  lastTextResponse: string | null;
  /**
   * The question of the last radio option the visitor filled out,
   * populated by RadioQuestionSubmission mutation
   */
  lastRadioQuestion: string | null;
  /**
   * The selected option  of the last radio option the visitor filled out,
   * populated by RadioQuestionSubmission mutation
   */
  lastRadioOptionSubmission: string | null;
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
