/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignFeaturedMediaBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, CampaignFeaturedMediaLayout, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignFeaturedMediaBlockUpdate
// ====================================================

export interface CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate_descriptionTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate_bulletsTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate {
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
  eyebrowTranslations: CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate_eyebrowTranslations[];
  titleTranslations: CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate_titleTranslations[];
  descriptionTranslations: CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate_descriptionTranslations[];
  bulletsTranslations: CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate_bulletsTranslations[];
}

export interface CampaignFeaturedMediaBlockUpdate {
  /**
   * Update a Featured Media section’s default-language eyebrow, title, description or bullets, its media side or layout, its Media Slot, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignFeaturedMediaBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title` / `description` / `bullets`): over 80 / 150 / 500 / 1000 characters.
   * - BAD_USER_INPUT (field: `mediaSide`): not left or right.
   * - BAD_USER_INPUT (field: `layout`): not sideBySide or stacked.
   * - BAD_USER_INPUT (field: `mediaBlockId`): not a CampaignVideoBlock or CampaignImageBlock this section owns (live, or soft-deleted by an earlier swap), or the block another of its slots holds.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a CampaignImageBlock this section owns (live, or soft-deleted by an earlier swap), or the block another of its slots holds.
   * - BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.
   */
  campaignFeaturedMediaBlockUpdate: CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate;
}

export interface CampaignFeaturedMediaBlockUpdateVariables {
  id: string;
  input: CampaignFeaturedMediaBlockUpdateInput;
  languageId?: string | null;
}
