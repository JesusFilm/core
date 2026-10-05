/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignBlockDelete
// ====================================================

export interface CampaignBlockDelete_campaignBlockDelete {
  __typename: "CampaignHeaderBlock" | "CampaignFooterBlock" | "CampaignTypographyBlock" | "CampaignButtonBlock" | "CampaignHeroBlock" | "CampaignRegionSwitcherBlock" | "CampaignVideoCarouselBlock" | "CampaignJourneyListBlock" | "CampaignAnalyticsBlock" | "CampaignRegionHeaderBlock" | "CampaignRegionShareBlock";
  id: string;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
}

export interface CampaignBlockDelete {
  /**
   * Soft-delete a campaign block: stamp `deletedAt` and renumber the remaining siblings contiguously. Returns those siblings with their new `parentOrder`. The row keeps everything, so `campaignBlockRestore` is how undo of a delete works.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live block.
   * - FORBIDDEN: caller is not in the team.
   * - CONFLICT (field: `id`): the header or footer; chrome is never deleted.
   */
  campaignBlockDelete: CampaignBlockDelete_campaignBlockDelete[];
}

export interface CampaignBlockDeleteVariables {
  id: string;
}
