/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL fragment: HeroTitleTranslations
// ====================================================

export interface HeroTitleTranslations_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface HeroTitleTranslations {
  __typename: "CampaignHeroBlock";
  titleTranslations: HeroTitleTranslations_titleTranslations[];
}
