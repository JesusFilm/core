/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignVideoCarouselBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, CampaignJourneyListDisplay, CampaignColumnsRatio, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignVideoCarouselBlockCreate
// ====================================================

export interface CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate {
  __typename: "CampaignVideoCarouselBlock";
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
  /**
   * The Watch Video to expand; null for explicit children.
   */
  videoId: string | null;
  videoVariantLanguageId: string | null;
}

export interface CampaignVideoCarouselBlockCreate {
  /**
   * Add a video carousel section to a page, last among its sections or at `parentOrder` with the later sections renumbered. It starts with no video and no items.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `pageId`): not a page of this campaign.
   * - BAD_USER_INPUT (field: `parentOrder`): negative.
   * - BAD_USER_INPUT (field: `parentBlockId`): not a live column slot on the page, already holding a section, or the section is a Columns or Region Share section.
   * - BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.
   */
  campaignVideoCarouselBlockCreate: CampaignVideoCarouselBlockCreate_campaignVideoCarouselBlockCreate;
}

export interface CampaignVideoCarouselBlockCreateVariables {
  input: CampaignVideoCarouselBlockCreateInput;
}
