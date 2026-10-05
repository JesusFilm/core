/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignChildPlacement } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignBlockOrderUpdate
// ====================================================

export interface CampaignBlockOrderUpdate_campaignBlockOrderUpdate_CampaignHeaderBlock {
  __typename: "CampaignHeaderBlock" | "CampaignFooterBlock" | "CampaignHeroBlock" | "CampaignRegionSwitcherBlock" | "CampaignVideoCarouselBlock" | "CampaignJourneyListBlock" | "CampaignAnalyticsBlock" | "CampaignRegionHeaderBlock" | "CampaignRegionShareBlock";
  id: string;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
}

export interface CampaignBlockOrderUpdate_campaignBlockOrderUpdate_CampaignTypographyBlock {
  __typename: "CampaignTypographyBlock";
  id: string;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  /**
   * Which side of the Section Body this Extra renders on; null on a Region Line.
   */
  placement: CampaignChildPlacement | null;
}

export interface CampaignBlockOrderUpdate_campaignBlockOrderUpdate_CampaignButtonBlock {
  __typename: "CampaignButtonBlock";
  id: string;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  placement: CampaignChildPlacement | null;
}

export type CampaignBlockOrderUpdate_campaignBlockOrderUpdate = CampaignBlockOrderUpdate_campaignBlockOrderUpdate_CampaignHeaderBlock | CampaignBlockOrderUpdate_campaignBlockOrderUpdate_CampaignTypographyBlock | CampaignBlockOrderUpdate_campaignBlockOrderUpdate_CampaignButtonBlock;

export interface CampaignBlockOrderUpdate {
  /**
   * Move a campaign block among its siblings to `parentOrder` (a position past the end moves it last) and renumber them contiguously. An Extra may change `placement` in the same move: crossing the Section Body updates the column, moving among neighbours is an order update only. Returns the renumbered siblings.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live block.
   * - FORBIDDEN: caller is not in the team.
   * - CONFLICT (field: `id`): the header, the footer, a column slot, a page, or an owned block with no order.
   * - BAD_USER_INPUT (field: `parentOrder`): negative.
   * - BAD_USER_INPUT (field: `placement`): not above or below, or given for a block that is not a section child.
   */
  campaignBlockOrderUpdate: CampaignBlockOrderUpdate_campaignBlockOrderUpdate[];
}

export interface CampaignBlockOrderUpdateVariables {
  id: string;
  parentOrder: number;
  placement?: CampaignChildPlacement | null;
}
