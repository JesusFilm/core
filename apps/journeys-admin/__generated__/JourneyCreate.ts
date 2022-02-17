/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus, TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyCreate
// ====================================================

export interface JourneyCreate_journeyCreate_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface JourneyCreate_journeyCreate_userJourneys {
  __typename: "UserJourney";
  id: string;
  user: JourneyCreate_journeyCreate_userJourneys_user | null;
}

export interface JourneyCreate_journeyCreate {
  __typename: "Journey";
  id: string;
  title: string;
  createdAt: any;
  publishedAt: any | null;
  description: string | null;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  locale: string;
  status: JourneyStatus;
  userJourneys: JourneyCreate_journeyCreate_userJourneys[] | null;
}

export interface JourneyCreate_stepBlockCreate {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to when a
   * NavigateAction occurs or if the user manually tries to advance to the next
   * step. If no nextBlockId is set it can be assumed that this step represents
   * the end of the current journey.
   */
  nextBlockId: string | null;
}

export interface JourneyCreate_cardBlockCreate {
  __typename: "CardBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * backgroundColor should be a HEX color value e.g #FFFFFF for white.
   */
  backgroundColor: string | null;
  /**
   * coverBlockId is present if a child block should be used as a cover.
   * This child block should not be rendered normally, instead it should be used
   * as a background. Blocks are often of type ImageBlock or VideoBlock.
   */
  coverBlockId: string | null;
  /**
   * themeMode can override journey themeMode. If nothing is set then use
   * themeMode from journey
   */
  themeMode: ThemeMode | null;
  /**
   * themeName can override journey themeName. If nothing is set then use
   * themeName from journey
   */
  themeName: ThemeName | null;
  /**
   * fullscreen should control how the coverBlock is displayed. When fullscreen
   * is set to true the coverBlock Image should be displayed as a blur in the
   * background.
   */
  fullscreen: boolean;
}

export interface JourneyCreate_imageBlockCreate {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export interface JourneyCreate_headlineTypography {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface JourneyCreate_bodyTypograpphy {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface JourneyCreate_captionTypography {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface JourneyCreate {
  journeyCreate: JourneyCreate_journeyCreate;
  stepBlockCreate: JourneyCreate_stepBlockCreate;
  cardBlockCreate: JourneyCreate_cardBlockCreate;
  imageBlockCreate: JourneyCreate_imageBlockCreate;
  headlineTypography: JourneyCreate_headlineTypography;
  bodyTypograpphy: JourneyCreate_bodyTypograpphy;
  captionTypography: JourneyCreate_captionTypography;
}

export interface JourneyCreateVariables {
  journeyId: string;
  title: string;
  slug: string;
  description: string;
  stepId: string;
  cardId: string;
  imageId: string;
  alt: string;
  headlineTypography: string;
  bodyTypography: string;
  captionTypography: string;
}
