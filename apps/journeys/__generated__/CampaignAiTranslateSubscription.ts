/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignAiTranslateMode, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL subscription operation: CampaignAiTranslateSubscription
// ====================================================

export interface CampaignAiTranslateSubscription_campaignAiTranslateSubscription_campaign_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignAiTranslateSubscription_campaignAiTranslateSubscription_campaign {
  __typename: "Campaign";
  id: string;
  titleTranslations: CampaignAiTranslateSubscription_campaignAiTranslateSubscription_campaign_titleTranslations[];
}

export interface CampaignAiTranslateSubscription_campaignAiTranslateSubscription {
  __typename: "CampaignAiTranslateProgress";
  /**
   * Translation progress as a percentage (0-100)
   */
  progress: number | null;
  /**
   * Current translation step message
   */
  message: string | null;
  /**
   * The campaign with its translations written (only present when complete)
   */
  campaign: CampaignAiTranslateSubscription_campaignAiTranslateSubscription_campaign | null;
}

export interface CampaignAiTranslateSubscription {
  /**
   * Machine-translate a campaign into one of its languages, a batch at a time, reporting progress after each. `missing` writes `{ value, source: machine }` only where the language has no entry; `all` also replaces machine entries. A person’s entries are never touched. Output longer than a field’s cap is cut to the cap.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaign does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `languageId`): not a campaign language other than the default, or not an api-languages language.
   */
  campaignAiTranslateSubscription: CampaignAiTranslateSubscription_campaignAiTranslateSubscription;
}

export interface CampaignAiTranslateSubscriptionVariables {
  campaignId: string;
  languageId: string;
  mode: CampaignAiTranslateMode;
}
