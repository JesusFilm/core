/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTypographyBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, CampaignFeaturedMediaLayout, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignTypographyBlockUpdate
// ====================================================

export interface CampaignTypographyBlockUpdate_campaignTypographyBlockUpdate_contentTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignTypographyBlockUpdate_campaignTypographyBlockUpdate {
  __typename: "CampaignTypographyBlock";
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
  content: string;
  /**
   * Null means body1.
   */
  typographyVariant: TypographyVariant | null;
  /**
   * Null means inherit from the section.
   */
  align: TypographyAlign | null;
  /**
   * `#RRGGBB`; null means the section override, then the theme.
   */
  color: string | null;
  /**
   * Which side of the Section Body this Extra renders on; null on a Region Line.
   */
  placement: CampaignChildPlacement | null;
  contentTranslations: CampaignTypographyBlockUpdate_campaignTypographyBlockUpdate_contentTranslations[];
}

export interface CampaignTypographyBlockUpdate {
  /**
   * Update a text block’s default-language content, variant, alignment, colour or placement. Only the given fields change; translations are untouched.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignTypographyBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `content`): over 2000 characters.
   * - BAD_USER_INPUT (field: `variant`, `align`, `color`, `placement`): the value fails its rule.
   * - BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.
   */
  campaignTypographyBlockUpdate: CampaignTypographyBlockUpdate_campaignTypographyBlockUpdate;
}

export interface CampaignTypographyBlockUpdateVariables {
  id: string;
  input: CampaignTypographyBlockUpdateInput;
  languageId?: string | null;
}
