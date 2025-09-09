/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: JourneyAiTranslateCreateSubscription
// ====================================================

export interface JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "CardBlock" | "IconBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoTriggerBlock";
  id: string;
}

export interface JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_TypographyBlock {
  __typename: "TypographyBlock";
  id: string;
  content: string;
}

export interface JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  label: string;
}

export interface JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_RadioOptionBlock {
  __typename: "RadioOptionBlock";
  id: string;
  label: string;
}

export interface JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  label: string;
  placeholder: string | null;
}

export type JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks = JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_ImageBlock | JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_TypographyBlock | JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_ButtonBlock | JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_RadioOptionBlock | JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks_TextResponseBlock;

export interface JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  languageId: string;
  createdAt: any;
  updatedAt: any;
  blocks: JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey_blocks[] | null;
}

export interface JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription {
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
  journey: JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription_journey | null;
}

export interface JourneyAiTranslateCreateSubscription {
  journeyAiTranslateCreateSubscription: JourneyAiTranslateCreateSubscription_journeyAiTranslateCreateSubscription;
}

export interface JourneyAiTranslateCreateSubscriptionVariables {
  journeyId: string;
  name: string;
  journeyLanguageName: string;
  textLanguageId: string;
  textLanguageName: string;
}
