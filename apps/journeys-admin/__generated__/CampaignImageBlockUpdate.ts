/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignImageBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, CampaignFeaturedMediaLayout, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignImageBlockUpdate
// ====================================================

export interface CampaignImageBlockUpdate_campaignImageBlockUpdate_altTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignImageBlockUpdate_campaignImageBlockUpdate {
  __typename: "CampaignImageBlock";
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
   * The Cloudflare image address (`https: // imagedelivery.net/…`), or the admin-hosted default header logo; null until an image is chosen.
   */
  src: string | null;
  /**
   * Visitor-facing alternative text; at most 500 characters.
   */
  alt: string | null;
  /**
   * Measured by the server from the image; never client-supplied.
   */
  width: number | null;
  /**
   * Measured by the server from the image; never client-supplied.
   */
  height: number | null;
  /**
   * The focal point as a percentage from the left edge (0 to 100, 50 by default): the part of the picture kept in view wherever it is scaled to fill.
   */
  focalLeft: number | null;
  /**
   * The focal point as a percentage from the top edge (0 to 100, 50 by default).
   */
  focalTop: number | null;
  /**
   * Zoom around the focal point as a percentage, 100 (none) to 200; null means none. Applied wherever the picture is scaled to fill.
   */
  scale: number | null;
  altTranslations: CampaignImageBlockUpdate_campaignImageBlockUpdate_altTranslations[];
}

export interface CampaignImageBlockUpdate {
  /**
   * Update an image’s address or default-language alt text, and for an Image section its Section Background and colour overrides. Only the given fields change; alt translations are untouched. A new `src` is re-measured by the server; null clears the image and its size.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignImageBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `src`): not an https imagedelivery.net address, or the image could not be read.
   * - BAD_USER_INPUT (field: `alt`): over 500 characters.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a CampaignImageBlock this section owns (live, or soft-deleted by an earlier swap), or the block another of its slots holds.
   * - BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.
   */
  campaignImageBlockUpdate: CampaignImageBlockUpdate_campaignImageBlockUpdate;
}

export interface CampaignImageBlockUpdateVariables {
  id: string;
  input: CampaignImageBlockUpdateInput;
  languageId?: string | null;
}
