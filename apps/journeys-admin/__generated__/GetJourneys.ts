/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneys
// ====================================================

export interface GetJourneys_journeys_usersJourneys {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
}

export interface GetJourneys_journeys {
  __typename: "Journey";
  title: string;
  description: string | null;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  locale: string;
  usersJourneys: GetJourneys_journeys_usersJourneys[] | null;
}

export interface GetJourneys {
  journeys: GetJourneys_journeys[];
}
