/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus } from "./globalTypes";

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
}

export interface JourneyCreate_cardBlockCreate {
  __typename: "CardBlock";
  id: string;
}

export interface JourneyCreate_imageBlockCreate {
  __typename: "ImageBlock";
  id: string;
}

export interface JourneyCreate_headlineTypographyBlockCreate {
  __typename: "TypographyBlock";
  id: string;
}

export interface JourneyCreate_bodyTypographyBlockCreate {
  __typename: "TypographyBlock";
  id: string;
}

export interface JourneyCreate_captionTypographyBlockCreate {
  __typename: "TypographyBlock";
  id: string;
}

export interface JourneyCreate {
  journeyCreate: JourneyCreate_journeyCreate;
  stepBlockCreate: JourneyCreate_stepBlockCreate;
  cardBlockCreate: JourneyCreate_cardBlockCreate;
  imageBlockCreate: JourneyCreate_imageBlockCreate;
  headlineTypographyBlockCreate: JourneyCreate_headlineTypographyBlockCreate;
  bodyTypographyBlockCreate: JourneyCreate_bodyTypographyBlockCreate;
  captionTypographyBlockCreate: JourneyCreate_captionTypographyBlockCreate;
}

export interface JourneyCreateVariables {
  journeyId: string;
  title: string;
  description: string;
  stepId: string;
  cardId: string;
  imageId: string;
  alt: string;
  headlineTypographyContent: string;
  bodyTypographyContent: string;
  captionTypographyContent: string;
}
