/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignButtonBlockUpdateInput, ButtonVariant, ButtonSize, TypographyAlign } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignButtonBlockUpdateStyle
// ====================================================

export interface CampaignButtonBlockUpdateStyle_campaignButtonBlockUpdate {
  __typename: "CampaignButtonBlock";
  id: string;
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
}

export interface CampaignButtonBlockUpdateStyle {
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
   */
  campaignButtonBlockUpdate: CampaignButtonBlockUpdateStyle_campaignButtonBlockUpdate;
}

export interface CampaignButtonBlockUpdateStyleVariables {
  id: string;
  input: CampaignButtonBlockUpdateInput;
}
