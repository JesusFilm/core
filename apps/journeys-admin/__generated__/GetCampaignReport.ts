/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCampaignReport
// ====================================================

export interface GetCampaignReport_campaign {
  __typename: "Campaign";
  id: string;
  /**
   * The shared-link token of the Campaign's own Plausible site (`api-journeys-campaign-<id>`), which the Campaign Report embeds. Null until the plausible worker has created the site, shortly after `campaignCreate`. Never on the CampaignPublic projection.
   */
  plausibleToken: string | null;
}

export interface GetCampaignReport {
  /**
   * Read one Campaign by id in its full admin shape, draft or published.
   * 
   * Auth: campaign Read — any member or manager of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   */
  campaign: GetCampaignReport_campaign;
}

export interface GetCampaignReportVariables {
  id: string;
}
