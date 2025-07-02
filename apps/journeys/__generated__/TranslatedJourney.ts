/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: TranslatedJourney
// ====================================================

export interface TranslatedJourney_blocks_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface TranslatedJourney_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  content: string;
}

export interface TranslatedJourney_blocks_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  label: string;
}

export interface TranslatedJourney_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  label: string;
}

export interface TranslatedJourney_blocks_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  label: string;
  placeholder: string | null;
}

export type TranslatedJourney_blocks = TranslatedJourney_blocks_ImageBlock | TranslatedJourney_blocks_TypographyBlock | TranslatedJourney_blocks_ButtonBlock | TranslatedJourney_blocks_RadioOptionBlock | TranslatedJourney_blocks_TextResponseBlock;

export interface TranslatedJourney {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  languageId: string;
  updatedAt: any;
  blocks: TranslatedJourney_blocks[] | null;
}
