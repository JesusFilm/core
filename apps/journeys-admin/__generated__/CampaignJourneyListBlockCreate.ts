/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignJourneyListBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, CampaignFeaturedMediaLayout, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignJourneyListBlockCreate
// ====================================================

export interface CampaignJourneyListBlockCreate_campaignJourneyListBlockCreate_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignJourneyListBlockCreate_campaignJourneyListBlockCreate_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignJourneyListBlockCreate_campaignJourneyListBlockCreate_descriptionTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignJourneyListBlockCreate_campaignJourneyListBlockCreate {
  __typename: "CampaignJourneyListBlock";
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
  description: string | null;
  display: CampaignJourneyListDisplay;
  eyebrowTranslations: CampaignJourneyListBlockCreate_campaignJourneyListBlockCreate_eyebrowTranslations[];
  titleTranslations: CampaignJourneyListBlockCreate_campaignJourneyListBlockCreate_titleTranslations[];
  descriptionTranslations: CampaignJourneyListBlockCreate_campaignJourneyListBlockCreate_descriptionTranslations[];
}

export interface CampaignJourneyListBlockCreate {
  /**
   * Add a journey list section to a page, last among its sections or at `parentOrder` with the later sections renumbered. It starts with no items.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `pageId`): not a page of this campaign.
   * - BAD_USER_INPUT (field: `parentOrder`): negative.
   * - BAD_USER_INPUT (field: `parentBlockId`): not a live column slot on the page, already holding a section, or the section is a Columns or Region Share section.
   * - BAD_USER_INPUT (field: `id`): not a UUID, or already the id of a block (live or deleted).
   * - BAD_USER_INPUT (field: `campaignId`): the add would take the campaign past 500 blocks.
   * - BAD_USER_INPUT (field: `eyebrow` / `title` / `description` / `display`): the value fails its rule.
   */
  campaignJourneyListBlockCreate: CampaignJourneyListBlockCreate_campaignJourneyListBlockCreate;
}

export interface CampaignJourneyListBlockCreateVariables {
  input: CampaignJourneyListBlockCreateInput;
  languageId?: string | null;
}
