/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVisitorForDetails
// ====================================================

export interface GetVisitorForDetails_visitor_userAgent_os {
  __typename: "OperatingSystem";
  name: string | null;
}

export interface GetVisitorForDetails_visitor_userAgent {
  __typename: "UserAgent";
  os: GetVisitorForDetails_visitor_userAgent_os;
}

export interface GetVisitorForDetails_visitor {
  __typename: "Visitor";
  id: string;
  /**
   * The last time the visitor called the ButtonClickEvent mutation where the url
   * is in the format of a recognized chat platform.
   */
  lastChatStartedAt: any | null;
  /**
   * The country code of the visitor as poulated by visitor ip address detected in
   * the JourneyViewEventCreate mutation. This field country code is converted
   * from an IP address by the @maxmind/geoip2-node library. If this field is empty
   * it is likely that the JourneyViewEventCreate mutation was not called by the
   * visitor or that the country was not able to be determined based on the
   * visitor IP address.
   */
  countryCode: string | null;
  /**
   * The user agent of the visitor as poulated by the visitor's user-agent string
   * detected in the JourneyViewEventCreate mutation. This field is enriched
   * by data from the ua-parser-js library. If this field is empty it is likely
   * that the JourneyViewEventCreate mutation was not called by the visitor.
   */
  userAgent: GetVisitorForDetails_visitor_userAgent | null;
}

export interface GetVisitorForDetails {
  /**
   * Get a single visitor
   */
  visitor: GetVisitorForDetails_visitor;
}

export interface GetVisitorForDetailsVariables {
  id: string;
}
