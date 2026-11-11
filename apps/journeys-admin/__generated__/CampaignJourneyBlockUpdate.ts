/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignJourneyBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay, TypographyAlign, CampaignSwitcherVariant, VideoLabel, CampaignJourneyListDisplay, JourneyStatus, CampaignColumnsRatio, CampaignMediaSide, CampaignFeaturedMediaLayout, VideoBlockSource, TypographyVariant, CampaignChildPlacement, ButtonVariant, ButtonSize, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignJourneyBlockUpdate
// ====================================================

export interface CampaignJourneyBlockUpdate_campaignJourneyBlockUpdate_journeyImage {
  __typename: "CampaignJourneyImage";
  src: string;
  alt: string | null;
}

export interface CampaignJourneyBlockUpdate_campaignJourneyBlockUpdate_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignJourneyBlockUpdate_campaignJourneyBlockUpdate_descriptionTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignJourneyBlockUpdate_campaignJourneyBlockUpdate {
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
  journeyImage: CampaignJourneyBlockUpdate_campaignJourneyBlockUpdate_journeyImage | null;
  /**
   * The linked journey. Null only if the row predates the link; never exposes the journey itself.
   */
  journeyId: string | null;
  /**
   * True once an author changed the snapshot title or description by hand, so "Refresh from journey" asks before replacing them. Refreshing from the journey clears it.
   */
  snapshotEdited: boolean;
  titleTranslations: CampaignJourneyBlockUpdate_campaignJourneyBlockUpdate_titleTranslations[];
  descriptionTranslations: CampaignJourneyBlockUpdate_campaignJourneyBlockUpdate_descriptionTranslations[];
}

export interface CampaignJourneyBlockUpdate {
  /**
   * Edit a journey card’s snapshot: its default-language title and description. Only the given fields change; translations are untouched. Editing the title or description marks the snapshot edited (`snapshotEdited`, which an undo can set back outright).
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignJourneyBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title` / `description`): over 200 / 1000 characters.
   * - BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.
   */
  campaignJourneyBlockUpdate: CampaignJourneyBlockUpdate_campaignJourneyBlockUpdate;
}

export interface CampaignJourneyBlockUpdateVariables {
  id: string;
  input: CampaignJourneyBlockUpdateInput;
  languageId?: string | null;
}
