/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL fragment: CampaignBlockTranslationFields
// ====================================================

export interface CampaignBlockTranslationFields_CampaignHeaderBlock {
  __typename: "CampaignHeaderBlock" | "CampaignFooterBlock" | "CampaignColumnsBlock" | "CampaignColumnBlock";
}

export interface CampaignBlockTranslationFields_CampaignHeroBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignHeroBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignHeroBlock_ledeTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignHeroBlock {
  __typename: "CampaignHeroBlock";
  eyebrowTranslations: CampaignBlockTranslationFields_CampaignHeroBlock_eyebrowTranslations[];
  titleTranslations: CampaignBlockTranslationFields_CampaignHeroBlock_titleTranslations[];
  descriptionTranslations: CampaignBlockTranslationFields_CampaignHeroBlock_ledeTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignRegionSwitcherBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignRegionSwitcherBlock {
  __typename: "CampaignRegionSwitcherBlock";
  titleTranslations: CampaignBlockTranslationFields_CampaignRegionSwitcherBlock_titleTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignVideoCarouselBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignVideoCarouselBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignVideoCarouselBlock {
  __typename: "CampaignVideoCarouselBlock";
  eyebrowTranslations: CampaignBlockTranslationFields_CampaignVideoCarouselBlock_eyebrowTranslations[];
  titleTranslations: CampaignBlockTranslationFields_CampaignVideoCarouselBlock_titleTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignJourneyListBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignJourneyListBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignJourneyListBlock_ledeTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignJourneyListBlock {
  __typename: "CampaignJourneyListBlock";
  eyebrowTranslations: CampaignBlockTranslationFields_CampaignJourneyListBlock_eyebrowTranslations[];
  titleTranslations: CampaignBlockTranslationFields_CampaignJourneyListBlock_titleTranslations[];
  descriptionTranslations: CampaignBlockTranslationFields_CampaignJourneyListBlock_ledeTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignAnalyticsBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignAnalyticsBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignAnalyticsBlock {
  __typename: "CampaignAnalyticsBlock";
  eyebrowTranslations: CampaignBlockTranslationFields_CampaignAnalyticsBlock_eyebrowTranslations[];
  titleTranslations: CampaignBlockTranslationFields_CampaignAnalyticsBlock_titleTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignRegionHeaderBlock_introTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignRegionHeaderBlock {
  __typename: "CampaignRegionHeaderBlock";
  introTranslations: CampaignBlockTranslationFields_CampaignRegionHeaderBlock_introTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignRegionShareBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignRegionShareBlock_introTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignRegionShareBlock {
  __typename: "CampaignRegionShareBlock";
  titleTranslations: CampaignBlockTranslationFields_CampaignRegionShareBlock_titleTranslations[];
  introTranslations: CampaignBlockTranslationFields_CampaignRegionShareBlock_introTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignTypographyBlock_contentTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignTypographyBlock {
  __typename: "CampaignTypographyBlock";
  contentTranslations: CampaignBlockTranslationFields_CampaignTypographyBlock_contentTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignButtonBlock_labelTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignButtonBlock {
  __typename: "CampaignButtonBlock";
  labelTranslations: CampaignBlockTranslationFields_CampaignButtonBlock_labelTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignJourneyBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignJourneyBlock_descriptionTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignJourneyBlock {
  __typename: "CampaignJourneyBlock";
  /**
   * The linked journey. Null only if the row predates the link; never exposes the journey itself.
   */
  journeyId: string | null;
  /**
   * True once an author changed the snapshot title or description by hand, so "Refresh from journey" asks before replacing them. Refreshing from the journey clears it.
   */
  snapshotEdited: boolean;
  titleTranslations: CampaignBlockTranslationFields_CampaignJourneyBlock_titleTranslations[];
  descriptionTranslations: CampaignBlockTranslationFields_CampaignJourneyBlock_descriptionTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignRichTextBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignRichTextBlock_richTextContentTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignRichTextBlock {
  __typename: "CampaignRichTextBlock";
  titleTranslations: CampaignBlockTranslationFields_CampaignRichTextBlock_titleTranslations[];
  richTextContentTranslations: CampaignBlockTranslationFields_CampaignRichTextBlock_richTextContentTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignFeaturedMediaBlock_eyebrowTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignFeaturedMediaBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignFeaturedMediaBlock_ledeTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignFeaturedMediaBlock_bulletsTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignFeaturedMediaBlock {
  __typename: "CampaignFeaturedMediaBlock";
  eyebrowTranslations: CampaignBlockTranslationFields_CampaignFeaturedMediaBlock_eyebrowTranslations[];
  titleTranslations: CampaignBlockTranslationFields_CampaignFeaturedMediaBlock_titleTranslations[];
  descriptionTranslations: CampaignBlockTranslationFields_CampaignFeaturedMediaBlock_ledeTranslations[];
  bulletsTranslations: CampaignBlockTranslationFields_CampaignFeaturedMediaBlock_bulletsTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignImageBlock_altTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignImageBlock {
  __typename: "CampaignImageBlock";
  altTranslations: CampaignBlockTranslationFields_CampaignImageBlock_altTranslations[];
}

export interface CampaignBlockTranslationFields_CampaignVideoBlock_titleTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignVideoBlock_descriptionTranslations {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignBlockTranslationFields_CampaignVideoBlock {
  __typename: "CampaignVideoBlock";
  titleTranslations: CampaignBlockTranslationFields_CampaignVideoBlock_titleTranslations[];
  descriptionTranslations: CampaignBlockTranslationFields_CampaignVideoBlock_descriptionTranslations[];
}

export type CampaignBlockTranslationFields = CampaignBlockTranslationFields_CampaignHeaderBlock | CampaignBlockTranslationFields_CampaignHeroBlock | CampaignBlockTranslationFields_CampaignRegionSwitcherBlock | CampaignBlockTranslationFields_CampaignVideoCarouselBlock | CampaignBlockTranslationFields_CampaignJourneyListBlock | CampaignBlockTranslationFields_CampaignAnalyticsBlock | CampaignBlockTranslationFields_CampaignRegionHeaderBlock | CampaignBlockTranslationFields_CampaignRegionShareBlock | CampaignBlockTranslationFields_CampaignTypographyBlock | CampaignBlockTranslationFields_CampaignButtonBlock | CampaignBlockTranslationFields_CampaignJourneyBlock | CampaignBlockTranslationFields_CampaignRichTextBlock | CampaignBlockTranslationFields_CampaignFeaturedMediaBlock | CampaignBlockTranslationFields_CampaignImageBlock | CampaignBlockTranslationFields_CampaignVideoBlock;
