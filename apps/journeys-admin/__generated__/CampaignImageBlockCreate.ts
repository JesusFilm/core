/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignImageBlockCreateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, CampaignFeaturedMediaLayout, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignImageBlockCreate
// ====================================================

export interface CampaignImageBlockCreate_campaignImageBlockCreate_altTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignImageBlockCreate_campaignImageBlockCreate {
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
  altTranslations: CampaignImageBlockCreate_campaignImageBlockCreate_altTranslations[];
}

export interface CampaignImageBlockCreate {
  /**
   * Add an image in one of two roles. With `pageId`: an Image section, last among the page’s sections or at `parentOrder`. With `parentBlockId` and `slot`: an owned image with `parentOrder: null` that becomes the parent’s background cover (any section or chrome block), the header logo, or the Media Slot of a hero or Featured Media section, replacing (soft-deleting) the block that slot held. `width` and `height` are measured by the server from `src`; the editor never supplies them.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `pageId`): not a page of this campaign.
   * - BAD_USER_INPUT (field: `parentOrder`): negative.
   * - BAD_USER_INPUT (field: `parentBlockId`): not a live section or chrome block of this campaign (the owned role; an Image section takes none).
   * - BAD_USER_INPUT (field: `id`): not a UUID, or already the id of a block (live or deleted).
   * - BAD_USER_INPUT (field: `campaignId`): the add would take the campaign past 500 blocks.
   * - BAD_USER_INPUT (field: `pageId`): neither or both of pageId and parentBlockId given.
   * - BAD_USER_INPUT (field: `logoBlockId`): the logo slot on a block that is not the header.
   * - BAD_USER_INPUT (field: `mediaBlockId`): the media slot on a block that is not a hero or Featured Media section.
   * - BAD_USER_INPUT (field: `src`): not an https imagedelivery.net address, or the image could not be read.
   * - BAD_USER_INPUT (field: `alt`): over 500 characters.
   */
  campaignImageBlockCreate: CampaignImageBlockCreate_campaignImageBlockCreate;
}

export interface CampaignImageBlockCreateVariables {
  input: CampaignImageBlockCreateInput;
  languageId?: string | null;
}
