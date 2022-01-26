/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneys
// ====================================================

export interface GetJourneys_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetJourneys_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  user: GetJourneys_journeys_userJourneys_user | null;
}

export interface GetJourneys_journeys {
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
  userJourneys: GetJourneys_journeys_userJourneys[] | null;
}

export interface GetJourneys {
  journeys: GetJourneys_journeys[];
}
