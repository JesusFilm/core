/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneys
// ====================================================

export interface GetJourneys_adminJourneys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export interface GetJourneys_adminJourneys_userJourneys {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
  user: GetJourneys_adminJourneys_userJourneys_user | null;
}

export interface GetJourneys_adminJourneys {
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
  userJourneys: GetJourneys_adminJourneys_userJourneys[] | null;
}

export interface GetJourneys {
  adminJourneys: GetJourneys_adminJourneys[];
}
