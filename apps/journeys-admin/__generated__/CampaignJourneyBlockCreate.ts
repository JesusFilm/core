/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignJourneyBlockCreate
// ====================================================

export interface CampaignJourneyBlockCreate_campaignJourneyBlockCreate_journeyImage {
  __typename: "CampaignJourneyImage";
  src: string;
  alt: string | null;
}

export interface CampaignJourneyBlockCreate_campaignJourneyBlockCreate_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignJourneyBlockCreate_campaignJourneyBlockCreate_descriptionTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignJourneyBlockCreate_campaignJourneyBlockCreate {
  __typename: "CampaignJourneyBlock";
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
  /**
   * Snapshot of the journey's title, editable; the default-language value.
   */
  title: string | null;
  /**
   * Snapshot of the journey's description, editable; the default-language value.
   */
  description: string | null;
  /**
   * The journey’s live status, read at request time; null when the journey was deleted. The public page shows a card only while this is `published` or `archived`.
   */
  journeyStatus: JourneyStatus | null;
  /**
   * The journey's public address, decided by its own team's domains; null unless the journey is published or archived.
   */
  journeyUrl: string | null;
  /**
   * The journey's primary image, read live; null when it has none.
   */
  journeyImage: CampaignJourneyBlockCreate_campaignJourneyBlockCreate_journeyImage | null;
  /**
   * The linked journey. Null only if the row predates the link; never exposes the journey itself.
   */
  journeyId: string | null;
  /**
   * True once an author changed the snapshot title or description by hand, so "Refresh from journey" asks before replacing them. Refreshing from the journey clears it.
   */
  snapshotEdited: boolean;
  titleTranslations: CampaignJourneyBlockCreate_campaignJourneyBlockCreate_titleTranslations[];
  descriptionTranslations: CampaignJourneyBlockCreate_campaignJourneyBlockCreate_descriptionTranslations[];
}

export interface CampaignJourneyBlockCreate {
  /**
   * Add a journey card to a journey list from a pasted link: an admin link (`/journeys/<id>`) or a public URL on any domain resolves to a published journey of any team, with the routing filter skipped, and its title and description are snapshotted as the default-language values. The item lands last among the list’s children (`parentOrder = siblings.length`), copying the list’s page scoping down. Linking another team’s journey needs no rights there.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: parentBlockId does not resolve to a live block.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `parentBlockId`): not a journey list.
   * - BAD_USER_INPUT (field: `url`): not a journey link, or "Journey not found or not published" (unknown, deleted or unpublished).
   */
  campaignJourneyBlockCreate: CampaignJourneyBlockCreate_campaignJourneyBlockCreate;
}

export interface CampaignJourneyBlockCreateVariables {
  id?: string | null;
  parentBlockId: string;
  url: string;
  languageId?: string | null;
}
