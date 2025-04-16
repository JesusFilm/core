/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { QrCodesFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: ShareDataQuery
// ====================================================

export interface ShareDataQuery_journey_team_customDomains {
  __typename: "CustomDomain";
  id: string;
  name: string;
  apexName: string;
  routeAllTeamJourneys: boolean;
}

export interface ShareDataQuery_journey_team {
  __typename: "Team";
  id: string;
  customDomains: ShareDataQuery_journey_team_customDomains[];
}

export interface ShareDataQuery_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
  team: ShareDataQuery_journey_team | null;
}

export interface ShareDataQuery_qrCodes_shortLink_domain {
  __typename: "ShortLinkDomain";
  hostname: string;
}

export interface ShareDataQuery_qrCodes_shortLink {
  __typename: "ShortLink";
  id: string;
  /**
   * short link path not including the leading slash
   */
  pathname: string;
  /**
   * the fully qualified domain name (FQDN) to redirect the short link service should redirect the user to
   */
  to: string;
  domain: ShareDataQuery_qrCodes_shortLink_domain;
}

export interface ShareDataQuery_qrCodes {
  __typename: "QrCode";
  id: string;
  toJourneyId: string | null;
  /**
   * ShortLink that handles the redirection
   */
  shortLink: ShareDataQuery_qrCodes_shortLink;
}

export interface ShareDataQuery {
  journey: ShareDataQuery_journey;
  qrCodes: ShareDataQuery_qrCodes[];
}

export interface ShareDataQueryVariables {
  id: string;
  qrCodeWhere: QrCodesFilter;
}
