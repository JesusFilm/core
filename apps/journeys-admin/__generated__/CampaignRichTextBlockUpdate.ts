/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignRichTextBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, CampaignFeaturedMediaLayout, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRichTextBlockUpdate
// ====================================================

export interface CampaignRichTextBlockUpdate_campaignRichTextBlockUpdate_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignRichTextBlockUpdate_campaignRichTextBlockUpdate_richTextContentTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignRichTextBlockUpdate_campaignRichTextBlockUpdate {
  __typename: "CampaignRichTextBlock";
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
  title: string | null;
  /**
   * Paragraphs separated by blank lines.
   */
  richTextContent: string | null;
  titleTranslations: CampaignRichTextBlockUpdate_campaignRichTextBlockUpdate_titleTranslations[];
  richTextContentTranslations: CampaignRichTextBlockUpdate_campaignRichTextBlockUpdate_richTextContentTranslations[];
}

export interface CampaignRichTextBlockUpdate {
  /**
   * Update the rich text section’s default-language title or content, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignRichTextBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title` / `content`): over 150 / 5000 characters.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a CampaignImageBlock this section owns (live, or soft-deleted by an earlier swap), or the block another of its slots holds.
   * - BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.
   */
  campaignRichTextBlockUpdate: CampaignRichTextBlockUpdate_campaignRichTextBlockUpdate;
}

export interface CampaignRichTextBlockUpdateVariables {
  id: string;
  input: CampaignRichTextBlockUpdateInput;
  languageId?: string | null;
}
