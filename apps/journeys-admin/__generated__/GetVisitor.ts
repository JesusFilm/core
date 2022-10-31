/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VisitorStatus, DeviceType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVisitor
// ====================================================

export interface GetVisitor_visitor_userAgent_browser {
  __typename: "Browser";
  name: string | null;
  version: string | null;
}

export interface GetVisitor_visitor_userAgent_device {
  __typename: "Device";
  model: string | null;
  type: DeviceType | null;
  vendor: string | null;
}

export interface GetVisitor_visitor_userAgent_os {
  __typename: "OperatingSystem";
  name: string | null;
  version: string | null;
}

export interface GetVisitor_visitor_userAgent {
  __typename: "UserAgent";
  browser: GetVisitor_visitor_userAgent_browser;
  device: GetVisitor_visitor_userAgent_device;
  os: GetVisitor_visitor_userAgent_os;
}

export interface GetVisitor_visitor {
  __typename: "Visitor";
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
   * The email address of the visitor as populated by mutation or otherwise via
   * SignUpEventSubmissionEventCreate mutation.
   */
  email: string | null;
  id: string;
  /**
   * The last time the visitor called the ButtonClickEvent mutation where the url
   * is in the format of a recognized chat platform.
   */
  lastChatStartedAt: any | null;
  /**
   * Messenger ID of the visitor as set by any journeys-admin user via the
   * VisitorUpdate mutation. This could be a phone number, user id or other
   * unique identifier provided by the messenger network.
   */
  messengerId: string | null;
  /**
   * Messenger network of the visitor as set by any journeys-admin user via the
   * VisitorUpdate mutation.
   */
  messengerNetwork: string | null;
  /**
   * The name of the visitor as populated by mutation or otherwise via
   * SignUpEventSubmissionEventCreate mutation.
   */
  name: string | null;
  /**
   * Private notes of the visitor as set by any journeys-admin user via the
   * VisitorUpdate mutation.
   */
  notes: string | null;
  /**
   * Status of the visitor as set by any journeys-admin user via the VisitorUpdate
   * mutation.
   */
  status: VisitorStatus | null;
  /**
   * The user agent of the visitor as poulated by the visitor's user-agent string
   * detected in the JourneyViewEventCreate mutation. This field is enriched
   * by data from the ua-parser-js library. If this field is empty it is likely
   * that the JourneyViewEventCreate mutation was not called by the visitor.
   */
  userAgent: GetVisitor_visitor_userAgent | null;
}

export interface GetVisitor {
  /**
   * Get a single visitor
   */
  visitor: GetVisitor_visitor;
}

export interface GetVisitorVariables {
  id: string;
}
