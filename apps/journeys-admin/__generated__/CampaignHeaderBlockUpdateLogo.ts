/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignHeaderBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignHeaderBlockUpdateLogo
// ====================================================

export interface CampaignHeaderBlockUpdateLogo_campaignHeaderBlockUpdate {
  __typename: "CampaignHeaderBlock";
  id: string;
  /**
   * The owned CampaignImageBlock shown as the brand mark.
   */
  logoBlockId: string | null;
}

export interface CampaignHeaderBlockUpdateLogo {
  /**
   * Update the header’s Section Background, colour overrides or logo. Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to the live CampaignHeaderBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock of this campaign.
   * - BAD_USER_INPUT (field: `logoBlockId`): not a live CampaignImageBlock of this campaign.
   */
  campaignHeaderBlockUpdate: CampaignHeaderBlockUpdateLogo_campaignHeaderBlockUpdate;
}

export interface CampaignHeaderBlockUpdateLogoVariables {
  id: string;
  input: CampaignHeaderBlockUpdateInput;
}
