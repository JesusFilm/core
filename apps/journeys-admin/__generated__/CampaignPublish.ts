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
   * Last published; kept after unpublish. Stamped on every move from `draft` to `published`, so it means "last went live", not "currently live".
   */
  publishedAt: any | null;
}

export interface CampaignPublish {
  /**
   * Move a `draft` Campaign to `published`, stamping `publishedAt` with the time of this publish (it means "last published"; unpublish keeps it). Idempotent: an already-published campaign is a no-op (no state change, no re-stamp). Queues on-demand revalidation of the landing page and every region page; nothing on a campaign is locked by its status.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team, the same as editing.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   */
  campaignPublish: CampaignPublish_campaignPublish;
}

export interface CampaignPublishVariables {
  id: string;
}
