/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignColumnsBlockUpdateInput, CampaignColumnsRatio } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignColumnsBlockUpdateRatio
// ====================================================

export interface CampaignColumnsBlockUpdateRatio_campaignColumnsBlockUpdate {
  __typename: "CampaignColumnsBlock";
  id: string;
  /**
   * Width of the two slots at `md` and up; defaults to equal.
   */
  ratio: CampaignColumnsRatio;
}

export interface CampaignColumnsBlockUpdateRatio {
  /**
   * Update the Columns section’s width ratio, or its Section Background and colour overrides. Only the given fields change; the slots and what they hold are untouched.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignColumnsBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `ratio`): not equal, wideLeft or wideRight.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a CampaignImageBlock this section owns (live, or soft-deleted by an earlier swap), or the block another of its slots holds.
   * - BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.
   */
  campaignColumnsBlockUpdate: CampaignColumnsBlockUpdateRatio_campaignColumnsBlockUpdate;
}

export interface CampaignColumnsBlockUpdateRatioVariables {
  id: string;
  input: CampaignColumnsBlockUpdateInput;
}
