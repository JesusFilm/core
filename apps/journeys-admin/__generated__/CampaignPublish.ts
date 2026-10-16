/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignPublish
// ====================================================

export interface CampaignPublish_campaignPublish {
  __typename: "Campaign";
  id: string;
  status: CampaignStatus;
  /**
   * First publish; never cleared by unpublish. Means "first went live", not "currently live".
   */
  publishedAt: any | null;
}

export interface CampaignPublish {
  /**
   * Move a `draft` Campaign to `published`, stamping `publishedAt` on the first publish only. Idempotent: an already-published campaign is a no-op (no state change, no re-stamp). Queues on-demand revalidation of the landing page and every region page; nothing on a campaign is locked by its status.
   * 
   * Auth: campaign Manage — a manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not a manager of the team.
   */
  campaignPublish: CampaignPublish_campaignPublish;
}

export interface CampaignPublishVariables {
  id: string;
}
