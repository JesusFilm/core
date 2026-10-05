/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignAnalyticsBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, CampaignJourneyListDisplay, CampaignMediaSide, VideoBlockSource, VideoLabel, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignAnalyticsBlockCreate
// ====================================================

export interface CampaignAnalyticsBlockCreate_campaignAnalyticsBlockCreate {
  __typename: "CampaignAnalyticsBlock";
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
  eyebrow: string | null;
  title: string | null;
  showMap: boolean;
}

export interface CampaignAnalyticsBlockCreate {
  /**
   * Add an analytics section to a page, last among its sections or at `parentOrder` with the later sections renumbered. Its scope follows the page it sits on.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `pageId`): not a page of this campaign.
   * - BAD_USER_INPUT (field: `parentOrder`): negative.
   * - BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.
   */
  campaignAnalyticsBlockCreate: CampaignAnalyticsBlockCreate_campaignAnalyticsBlockCreate;
}

export interface CampaignAnalyticsBlockCreateVariables {
  input: CampaignAnalyticsBlockCreateInput;
  languageId?: string | null;
}
