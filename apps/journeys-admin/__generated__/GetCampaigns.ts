/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignFields } from "./CampaignFields";

// ====================================================
// GraphQL query operation: GetCampaigns
// ====================================================

export type GetCampaigns_campaigns = CampaignFields;

export interface GetCampaigns {
  campaigns: GetCampaigns_campaigns[];
}

export interface GetCampaignsVariables {
  teamId: string;
}
