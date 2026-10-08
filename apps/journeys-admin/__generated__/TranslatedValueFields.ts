/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL fragment: TranslatedValueFields
// ====================================================

export interface TranslatedValueFields {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}
