/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignUnpublish
// ====================================================

export interface CampaignUnpublish_campaignUnpublish {
  __typename: "Campaign";
  id: string;
  status: CampaignStatus;
  /**
   * First publish; never cleared by unpublish. Means "first went live", not "currently live".
   */
  publishedAt: any | null;
}

export interface CampaignUnpublish {
  /**
   * Move a `published` Campaign back to `draft`. `publishedAt` is kept: it means "first went live", not "currently live". Idempotent: an already-draft campaign is a no-op. Queues on-demand revalidation so the public pages stop serving within the publish bound; the linked journeys and their QR codes keep working at their own addresses.
   * 
   * Auth: campaign Manage — a manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not a manager of the team.
   */
  campaignUnpublish: CampaignUnpublish_campaignUnpublish;
}

export interface CampaignUnpublishVariables {
  id: string;
}
