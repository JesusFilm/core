/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignJourneyBlockSnapshotRefresh
// ====================================================

export interface CampaignJourneyBlockSnapshotRefresh_campaignJourneyBlockSnapshotRefresh {
  __typename: "CampaignJourneyBlock";
  id: string;
  /**
   * Snapshot of the journey's title, editable; the default-language value.
   */
  title: string | null;
  /**
   * Snapshot of the journey's description, editable; the default-language value.
   */
  description: string | null;
  /**
   * True once an author changed the snapshot title or description by hand, so "Refresh from journey" asks before replacing them. Refreshing from the journey clears it.
   */
  snapshotEdited: boolean;
}

export interface CampaignJourneyBlockSnapshotRefresh {
  /**
   * Re-read the journey’s title and description and replace the card’s default-language values with them, including any edit the author made, and clear `snapshotEdited`. Translations are kept. The refresh is manual; nothing re-reads a snapshot on its own.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignJourneyBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `id`): "Journey not found, or not published or archived" — the journey is gone, or neither published nor archived any more.
   */
  campaignJourneyBlockSnapshotRefresh: CampaignJourneyBlockSnapshotRefresh_campaignJourneyBlockSnapshotRefresh;
}

export interface CampaignJourneyBlockSnapshotRefreshVariables {
  id: string;
}
