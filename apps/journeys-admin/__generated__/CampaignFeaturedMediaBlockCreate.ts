/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignFeaturedMediaBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, CampaignFeaturedMediaLayout, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignFeaturedMediaBlockCreate
// ====================================================

export interface CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate_descriptionTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate_bulletsTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate {
  __typename: "CampaignFeaturedMediaBlock";
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
  /**
   * One bullet per line; the viewer splits on line breaks.
   */
  bullets: string | null;
  /**
   * Which side the media sits on at `md` and up.
   */
  mediaSide: CampaignMediaSide;
  /**
   * `sideBySide` puts the text and the media beside each other; `stacked` puts the title, description and bullets above the media at full width, and `mediaSide` has no effect.
   */
  layout: CampaignFeaturedMediaLayout;
  /**
   * The owned CampaignVideoBlock or CampaignImageBlock in the Media Slot.
   */
  mediaBlockId: string | null;
  eyebrowTranslations: CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate_eyebrowTranslations[];
  titleTranslations: CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate_titleTranslations[];
  descriptionTranslations: CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate_descriptionTranslations[];
  bulletsTranslations: CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate_bulletsTranslations[];
}

export interface CampaignFeaturedMediaBlockCreate {
  /**
   * Add a Featured Media section to a page, last among its sections or at `parentOrder` with the later sections renumbered. It starts with an empty Media Slot; text is empty when omitted and the media sits on the right unless `mediaSide` says otherwise.
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
   * - BAD_USER_INPUT (field: `eyebrow` / `title` / `description` / `bullets`): over 80 / 150 / 500 / 1000 characters.
   * - BAD_USER_INPUT (field: `mediaSide`): not left or right.
   */
  campaignFeaturedMediaBlockCreate: CampaignFeaturedMediaBlockCreate_campaignFeaturedMediaBlockCreate;
}

export interface CampaignFeaturedMediaBlockCreateVariables {
  input: CampaignFeaturedMediaBlockCreateInput;
  languageId?: string | null;
}
