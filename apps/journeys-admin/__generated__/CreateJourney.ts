/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateJourney
// ====================================================

export interface CreateJourney_journeyCreate_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CreateJourney_journeyCreate_language {
  __typename: "Language";
  id: string;
  name: CreateJourney_journeyCreate_language_name[];
}

export interface CreateJourney_journeyCreate_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface CreateJourney_journeyCreate_userJourneys {
  __typename: "UserJourney";
  id: string | null;
  user: CreateJourney_journeyCreate_userJourneys_user | null;
}

export interface CreateJourney_journeyCreate {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  createdAt: any;
  publishedAt: any | null;
  description: string | null;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  language: CreateJourney_journeyCreate_language;
  status: JourneyStatus;
  userJourneys: CreateJourney_journeyCreate_userJourneys[] | null;
}

export interface CreateJourney_stepBlockCreate {
  __typename: "StepBlock";
  id: string;
}

export interface CreateJourney_cardBlockCreate {
  __typename: "CardBlock";
  id: string;
}

export interface CreateJourney_imageBlockCreate {
  __typename: "ImageBlock";
  id: string;
}

export interface CreateJourney_headlineTypographyBlockCreate {
  __typename: "TypographyBlock";
  id: string;
}

export interface CreateJourney_bodyTypographyBlockCreate {
  __typename: "TypographyBlock";
  id: string;
}

export interface CreateJourney_captionTypographyBlockCreate {
  __typename: "TypographyBlock";
  id: string;
}

export interface CreateJourney {
  journeyCreate: CreateJourney_journeyCreate;
  stepBlockCreate: CreateJourney_stepBlockCreate;
  cardBlockCreate: CreateJourney_cardBlockCreate;
  imageBlockCreate: CreateJourney_imageBlockCreate;
  headlineTypographyBlockCreate: CreateJourney_headlineTypographyBlockCreate;
  bodyTypographyBlockCreate: CreateJourney_bodyTypographyBlockCreate;
  captionTypographyBlockCreate: CreateJourney_captionTypographyBlockCreate;
}

export interface CreateJourneyVariables {
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
  teamId: string;
}
