/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignImageBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignImageBlockUpdateStyle
// ====================================================

export interface CampaignImageBlockUpdateStyle_campaignImageBlockUpdate {
  __typename: "CampaignImageBlock";
  id: string;
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
}

export interface CampaignImageBlockUpdateStyle {
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
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock owned by this section.
   */
  campaignImageBlockUpdate: CampaignImageBlockUpdateStyle_campaignImageBlockUpdate;
}

export interface CampaignImageBlockUpdateStyleVariables {
  id: string;
  input: CampaignImageBlockUpdateInput;
}
