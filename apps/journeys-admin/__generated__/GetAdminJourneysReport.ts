/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneysReportType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetAdminJourneysReport
// ====================================================

export interface GetAdminJourneysReport_adminJourneysReport {
  __typename: "PowerBiEmbed";
  /**
   * The embed URL of the report
   */
  embedUrl: string;
  /**
   * The embed token
   */
  accessToken: string;
}

export interface GetAdminJourneysReport {
  adminJourneysReport: GetAdminJourneysReport_adminJourneysReport | null;
}

export interface GetAdminJourneysReportVariables {
  reportType: JourneysReportType;
}
