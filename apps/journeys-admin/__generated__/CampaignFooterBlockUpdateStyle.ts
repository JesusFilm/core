/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignFooterBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignFooterBlockUpdateStyle
// ====================================================

export interface CampaignFooterBlockUpdateStyle_campaignFooterBlockUpdate {
  __typename: "CampaignFooterBlock";
  id: string;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
}

export interface CampaignFooterBlockUpdateStyle {
  /**
   * Update the footer’s Section Background and colour overrides. Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to the live CampaignFooterBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock owned by this section.
   */
  campaignFooterBlockUpdate: CampaignFooterBlockUpdateStyle_campaignFooterBlockUpdate;
}

export interface CampaignFooterBlockUpdateStyleVariables {
  id: string;
  input: CampaignFooterBlockUpdateInput;
}
