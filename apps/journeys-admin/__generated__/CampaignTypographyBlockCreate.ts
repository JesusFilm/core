/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTypographyBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, CampaignJourneyListDisplay, JourneyStatus, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignTypographyBlockCreate
// ====================================================

export interface CampaignTypographyBlockCreate_campaignTypographyBlockCreate {
  __typename: "CampaignTypographyBlock";
  id: string;
  campaignId: string;
  /**
   * The Campaign Page this block sits on, if page-scoped.
   */
  pageId: string | null;
  /**
   * The Campaign Region this block belongs to, if region-scoped (a Region Line).
   */
  regionId: string | null;
  parentBlockId: string | null;
  /**
   * Order among siblings. Null on an owned block (a cover, logo or media slot).
   */
  parentOrder: number | null;
  content: string;
  /**
   * Null means body1.
   */
  typographyVariant: TypographyVariant | null;
  /**
   * Null means inherit from the section.
   */
  align: TypographyAlign | null;
  /**
   * `#RRGGBB`; null means the section override, then the theme.
   */
  color: string | null;
  /**
   * Which side of the Section Body this Extra renders on; null on a Region Line.
   */
  placement: CampaignChildPlacement | null;
}

export interface CampaignTypographyBlockCreate {
  /**
   * Add a text block: with `parentBlockId`, a text Extra of a section or chrome block, landing last among its siblings (`parentOrder = siblings.length`) on the side the placement names and copying the parent’s page or region scoping down; with `regionId`, a Region Line, scoped to the region alone (`pageId`, `parentBlockId` and `placement` null) and appended last among the region’s lines. Omitted content is empty; the editor shows the placeholder "Your text".
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `parentBlockId`): not a live section or chrome block of this campaign, or neither / both of parentBlockId and regionId given.
   * - BAD_USER_INPUT (field: `regionId`): not a region of this campaign.
   * - BAD_USER_INPUT (field: `content`, `variant`, `align`, `color`, `placement`): the value fails its rule; placement is refused on a Region Line.
   */
  campaignTypographyBlockCreate: CampaignTypographyBlockCreate_campaignTypographyBlockCreate;
}

export interface CampaignTypographyBlockCreateVariables {
  input: CampaignTypographyBlockCreateInput;
}
