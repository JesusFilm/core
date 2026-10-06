/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignColumnsBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, CampaignJourneyListDisplay, CampaignColumnsRatio, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignColumnsBlockCreate
// ====================================================

export interface CampaignColumnsBlockCreate_campaignColumnsBlockCreate {
  __typename: "CampaignColumnsBlock";
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
  /**
   * Width of the two slots at `md` and up; defaults to equal.
   */
  ratio: CampaignColumnsRatio;
}

export interface CampaignColumnsBlockCreate {
  /**
   * Add a two-column section to a page, last among its sections or at `parentOrder` with the later sections renumbered. The two empty CampaignColumnBlock slots are created with it, in the same transaction, at parentOrder 0 and 1.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `pageId`): not a page of this campaign.
   * - BAD_USER_INPUT (field: `parentOrder`): negative.
   * - BAD_USER_INPUT (field: `parentBlockId`): not a live column slot on the page, already holding a section, or the section is a Columns or Region Share section.
   * - BAD_USER_INPUT (field: `ratio`): not equal, wideLeft or wideRight.
   * - BAD_USER_INPUT (field: `slotIds`): given with other than two ids.
   */
  campaignColumnsBlockCreate: CampaignColumnsBlockCreate_campaignColumnsBlockCreate;
}

export interface CampaignColumnsBlockCreateVariables {
  input: CampaignColumnsBlockCreateInput;
}
