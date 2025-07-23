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
  os: GetVisitorForDetails_visitor_userAgent_os | null;
}

export interface GetVisitorForDetails_visitor {
  __typename: "Visitor";
  id: string | null;
  lastChatStartedAt: any | null;
  countryCode: string | null;
  userAgent: GetVisitorForDetails_visitor_userAgent | null;
}

export interface GetVisitorForDetails {
  visitor: GetVisitorForDetails_visitor | null;
}

export interface GetVisitorForDetailsVariables {
  id: string;
}
