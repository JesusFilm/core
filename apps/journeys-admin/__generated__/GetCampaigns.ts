/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCampaigns
// ====================================================

export interface GetCampaigns_campaigns {
  __typename: "Campaign";
  id: string;
  teamId: string;
  /**
   * Default-language title; also the public page title. Required, at most 100 characters.
   */
  title: string;
  /**
   * Globally unique. The permanent Campaign Address is `/campaign/<slug>` on the root domain. Generated from the title; author-editable.
   */
  slug: string;
  status: CampaignStatus;
  /**
   * First publish; never cleared by unpublish. Means "first went live", not "currently live".
   */
  publishedAt: any | null;
  createdAt: any;
  updatedAt: any;
}

export interface GetCampaigns {
  /**
   * List a team's Campaigns, draft and published, newest first.
   * 
   * Auth: campaign Read — any member or manager of the team.
   * 
   * Errors:
   * - NOT_FOUND: the team does not exist.
   * - FORBIDDEN: caller is not in the team.
   */
  campaigns: GetCampaigns_campaigns[];
}

export interface GetCampaignsVariables {
  teamId: string;
}
