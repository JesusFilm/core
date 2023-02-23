/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTrashedJourneys
// ====================================================

export interface GetTrashedJourneys_journeys_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetTrashedJourneys_journeys_language {
  __typename: "Language";
  id: string;
  name: GetTrashedJourneys_journeys_language_name[];
}

export interface GetTrashedJourneys_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetTrashedJourneys_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetTrashedJourneys_journeys_userJourneys_user | null;
}

export interface GetTrashedJourneys_journeys {
  __typename: "Journey";
  id: string;
  title: string;
  createdAt: any;
  publishedAt: any | null;
  trashedAt: any | null;
  description: string | null;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  language: GetTrashedJourneys_journeys_language;
  status: JourneyStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  userJourneys: GetTrashedJourneys_journeys_userJourneys[] | null;
}

export interface GetTrashedJourneys {
  journeys: GetTrashedJourneys_journeys[];
}
