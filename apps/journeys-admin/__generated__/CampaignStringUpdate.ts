/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignStringKey } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignStringUpdate
// ====================================================

export interface CampaignStringUpdate_campaignStringUpdate {
  __typename: "CampaignString";
  id: string;
  key: CampaignStringKey;
  /**
   * Default-language wording, at most 200 characters.
   */
  value: string;
}

export interface CampaignStringUpdate {
  /**
   * Update the default-language wording of one Campaign String. The seventeen rows are seeded with the campaign and never deleted while it exists, so the string is addressed by its key. Translations are untouched; they go through `campaignTranslationSet` with `stringId`. A Command in the editor.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaign does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `value`): over 200 characters.
   */
  campaignStringUpdate: CampaignStringUpdate_campaignStringUpdate;
}

export interface CampaignStringUpdateVariables {
  campaignId: string;
  key: CampaignStringKey;
  value: string;
}
