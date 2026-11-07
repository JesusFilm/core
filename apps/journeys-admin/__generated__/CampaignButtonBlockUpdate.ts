/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignButtonBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, CampaignFeaturedMediaLayout, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignButtonBlockUpdate
// ====================================================

export interface CampaignButtonBlockUpdate_campaignButtonBlockUpdate_action_CampaignLinkAction {
  __typename: "CampaignLinkAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  url: string;
  target: string | null;
}

export interface CampaignButtonBlockUpdate_campaignButtonBlockUpdate_action_CampaignScrollToBlockAction {
  __typename: "CampaignScrollToBlockAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  blockId: string;
}

export interface CampaignButtonBlockUpdate_campaignButtonBlockUpdate_action_CampaignNavigateToRegionAction {
  __typename: "CampaignNavigateToRegionAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  /**
   * Null once the region has been deleted.
   */
  regionId: string | null;
}

export type CampaignButtonBlockUpdate_campaignButtonBlockUpdate_action = CampaignButtonBlockUpdate_campaignButtonBlockUpdate_action_CampaignLinkAction | CampaignButtonBlockUpdate_campaignButtonBlockUpdate_action_CampaignScrollToBlockAction | CampaignButtonBlockUpdate_campaignButtonBlockUpdate_action_CampaignNavigateToRegionAction;

export interface CampaignButtonBlockUpdate_campaignButtonBlockUpdate_labelTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignButtonBlockUpdate_campaignButtonBlockUpdate {
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
  action: CampaignButtonBlockUpdate_campaignButtonBlockUpdate_action | null;
  labelTranslations: CampaignButtonBlockUpdate_campaignButtonBlockUpdate_labelTranslations[];
}

export interface CampaignButtonBlockUpdate {
  /**
   * Update a button’s default-language label, variant, size, alignment, colours or placement. Only the given fields change; the action and translations are untouched.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignButtonBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `label`): over 60 characters.
   * - BAD_USER_INPUT (field: `variant`, `size`, `align`, `color`, `labelColor`, `placement`): the value fails its rule.
   * - BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.
   */
  campaignButtonBlockUpdate: CampaignButtonBlockUpdate_campaignButtonBlockUpdate;
}

export interface CampaignButtonBlockUpdateVariables {
  id: string;
  input: CampaignButtonBlockUpdateInput;
  languageId?: string | null;
}
