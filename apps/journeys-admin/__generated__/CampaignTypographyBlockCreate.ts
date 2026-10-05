/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTypographyBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, CampaignJourneyListDisplay, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

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
   * Add a text Extra to a section or chrome block. A new Extra lands last among its siblings (`parentOrder = siblings.length`) on the side the placement names, and copies the parent’s page or region scoping down. Omitted content is empty; the editor shows the placeholder "Your text".
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `parentBlockId`): not a live section or chrome block of this campaign.
   * - BAD_USER_INPUT (field: `content`, `variant`, `align`, `color`, `placement`): the value fails its rule.
   */
  campaignTypographyBlockCreate: CampaignTypographyBlockCreate_campaignTypographyBlockCreate;
}

export interface CampaignTypographyBlockCreateVariables {
  input: CampaignTypographyBlockCreateInput;
}
