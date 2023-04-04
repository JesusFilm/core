/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetArchivedJourneys
// ====================================================

export interface GetArchivedJourneys_journeys_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetArchivedJourneys_journeys_language {
  __typename: "Language";
  id: string;
  name: GetArchivedJourneys_journeys_language_name[];
}

export interface GetArchivedJourneys_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetArchivedJourneys_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetArchivedJourneys_journeys_userJourneys_user | null;
}

export interface GetArchivedJourneys_journeys {
  __typename: "Journey";
  id: string;
  title: string;
  createdAt: any;
  publishedAt: any | null;
  description: string | null;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  language: GetArchivedJourneys_journeys_language;
  status: JourneyStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  userJourneys: GetArchivedJourneys_journeys_userJourneys[] | null;
}

export interface GetArchivedJourneys {
  journeys: GetArchivedJourneys_journeys[];
}
