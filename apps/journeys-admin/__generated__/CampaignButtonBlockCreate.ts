/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignButtonBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, CampaignMediaSide, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignButtonBlockCreate
// ====================================================

export interface CampaignButtonBlockCreate_campaignButtonBlockCreate_action_CampaignLinkAction {
  __typename: "CampaignLinkAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  url: string;
  target: string | null;
}

export interface CampaignButtonBlockCreate_campaignButtonBlockCreate_action_CampaignScrollToBlockAction {
  __typename: "CampaignScrollToBlockAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  blockId: string;
}

export interface CampaignButtonBlockCreate_campaignButtonBlockCreate_action_CampaignNavigateToRegionAction {
  __typename: "CampaignNavigateToRegionAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  regionId: string;
}

export type CampaignButtonBlockCreate_campaignButtonBlockCreate_action = CampaignButtonBlockCreate_campaignButtonBlockCreate_action_CampaignLinkAction | CampaignButtonBlockCreate_campaignButtonBlockCreate_action_CampaignScrollToBlockAction | CampaignButtonBlockCreate_campaignButtonBlockCreate_action_CampaignNavigateToRegionAction;

export interface CampaignButtonBlockCreate_campaignButtonBlockCreate {
  __typename: "CampaignButtonBlock";
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
  label: string;
  /**
   * Null means contained.
   */
  buttonVariant: ButtonVariant | null;
  /**
   * Null means medium.
   */
  size: ButtonSize | null;
  /**
   * Null means follow the section.
   */
  align: TypographyAlign | null;
  /**
   * Fill (contained) or border and label (outlined). Null means the section buttonColor, then the theme primary.
   */
  color: string | null;
  /**
   * Label colour for contained. Null means the section buttonTextColor, then on-primary.
   */
  labelColor: string | null;
  placement: CampaignChildPlacement | null;
  action: CampaignButtonBlockCreate_campaignButtonBlockCreate_action | null;
}

export interface CampaignButtonBlockCreate {
  /**
   * Add a button Extra to a section or chrome block, with no action. A new Extra lands last among its siblings (`parentOrder = siblings.length`) on the side the placement names, and copies the parent’s page or region scoping down. An omitted label is "Button".
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `parentBlockId`): not a live section or chrome block of this campaign.
   * - BAD_USER_INPUT (field: `label`, `variant`, `size`, `align`, `color`, `labelColor`, `placement`): the value fails its rule.
   */
  campaignButtonBlockCreate: CampaignButtonBlockCreate_campaignButtonBlockCreate;
}

export interface CampaignButtonBlockCreateVariables {
  input: CampaignButtonBlockCreateInput;
  languageId?: string | null;
}
