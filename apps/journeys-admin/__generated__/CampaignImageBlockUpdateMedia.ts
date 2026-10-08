/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignImageBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignImageBlockUpdateMedia
// ====================================================

export interface CampaignImageBlockUpdateMedia_campaignImageBlockUpdate {
  __typename: "CampaignImageBlock";
  id: string;
  /**
   * The Cloudflare image address (`https: // imagedelivery.net/…`); null until an image is chosen.
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
}

export interface CampaignImageBlockUpdateMedia {
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
  campaignImageBlockUpdate: CampaignImageBlockUpdateMedia_campaignImageBlockUpdate;
}

export interface CampaignImageBlockUpdateMediaVariables {
  id: string;
  input: CampaignImageBlockUpdateInput;
}
