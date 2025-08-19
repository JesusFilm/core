/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: JourneyAiTranslateCreate
// ====================================================

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "CardBlock" | "IconBlock" | "SignUpBlock" | "SpacerBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock" | "VideoBlockContent";
  id: string;
}

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  content: string | null;
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  label: string | null;
}

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  label: string | null;
}

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_RadioQuestionBlock {
  __typename: "RadioQuestionBlock";
  id: string;
  label: string | null;
}

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  label: string | null;
  placeholder: string | null;
}

export type JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks = JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_ImageBlock | JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_TypographyBlock | JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_ButtonBlock | JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_RadioOptionBlock | JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_RadioQuestionBlock | JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks_TextResponseBlock;

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate_journey {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  languageId: string | null;
  createdAt: any;
  updatedAt: any;
  blocks: JourneyAiTranslateCreate_journeyAiTranslateCreate_journey_blocks[] | null;
}

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate {
  __typename: "JourneyAiTranslateProgress";
  /**
   * Translation progress as a percentage (0-100)
   */
  progress: number | null;
  /**
   * Current translation step message
   */
  message: string | null;
  /**
   * The journey being translated (only present when complete)
   */
  journey: JourneyAiTranslateCreate_journeyAiTranslateCreate_journey | null;
}

export interface JourneyAiTranslateCreate {
  journeyAiTranslateCreate: JourneyAiTranslateCreate_journeyAiTranslateCreate;
}

export interface JourneyAiTranslateCreateVariables {
  journeyId: string;
  name: string;
  journeyLanguageName: string;
  textLanguageId: string;
  textLanguageName: string;
}
