/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetActiveJourneys
// ====================================================

export interface GetActiveJourneys_journeys_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetActiveJourneys_journeys_language {
  __typename: "Language";
  id: string;
  name: GetActiveJourneys_journeys_language_name[];
}

export interface GetActiveJourneys_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetActiveJourneys_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetActiveJourneys_journeys_userJourneys_user | null;
}

export interface GetActiveJourneys_journeys {
  __typename: "Journey";
  id: string;
  title: string;
  createdAt: any;
  publishedAt: any | null;
  description: string | null;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  language: GetActiveJourneys_journeys_language;
  status: JourneyStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  userJourneys: GetActiveJourneys_journeys_userJourneys[] | null;
}

export interface GetActiveJourneys {
  journeys: GetActiveJourneys_journeys[];
}
