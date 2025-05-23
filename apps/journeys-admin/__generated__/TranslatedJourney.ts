/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: TranslatedJourney
// ====================================================

export interface TranslatedJourney_blocks_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "CardBlock" | "IconBlock" | "SignUpBlock" | "SpacerBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock" | "VideoBlockContent";
  id: string;
}

export interface TranslatedJourney_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  content: string | null;
}

export interface TranslatedJourney_blocks_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  label: string | null;
}

export interface TranslatedJourney_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  label: string | null;
}

export interface TranslatedJourney_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  label: string | null;
}

export interface TranslatedJourney_blocks_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  label: string | null;
  placeholder: string | null;
}

export type TranslatedJourney_blocks = TranslatedJourney_blocks_ImageBlock | TranslatedJourney_blocks_TypographyBlock | TranslatedJourney_blocks_ButtonBlock | TranslatedJourney_blocks_RadioOptionBlock | TranslatedJourney_blocks_RadioQuestionBlock | TranslatedJourney_blocks_TextResponseBlock;

export interface TranslatedJourney {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  languageId: string | null;
  updatedAt: any;
  blocks: TranslatedJourney_blocks[] | null;
}
