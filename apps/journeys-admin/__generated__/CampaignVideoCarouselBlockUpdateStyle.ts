/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignVideoCarouselBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignVideoCarouselBlockUpdateStyle
// ====================================================

export interface CampaignVideoCarouselBlockUpdateStyle_campaignVideoCarouselBlockUpdate {
  __typename: "CampaignVideoCarouselBlock";
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

export interface CampaignVideoCarouselBlockUpdateStyle {
  /**
   * Update the video carousel’s default-language eyebrow or title, its Section Background and colour overrides, or the Watch Video it expands. A Watch `url` is stripped of its `.html` parts to a variant slug and resolved through the gateway, and only its ids are stored — the variant language is the campaign default at link time. `videoId` null switches the carousel to its explicit items; the nullable id is the mode, so there is no `mode` column.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock; a Watch url that resolves to no published Video.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.
   * - BAD_USER_INPUT (field: `url`): not a Watch address.
   * - BAD_USER_INPUT (field: `videoId`): given with a `url`.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock of this campaign.
   */
  campaignVideoCarouselBlockUpdate: CampaignVideoCarouselBlockUpdateStyle_campaignVideoCarouselBlockUpdate;
}

export interface CampaignVideoCarouselBlockUpdateStyleVariables {
  id: string;
  input: CampaignVideoCarouselBlockUpdateInput;
}
