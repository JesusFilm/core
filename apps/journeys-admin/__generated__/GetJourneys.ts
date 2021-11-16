/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneys
// ====================================================

export interface GetJourneys_journeys {
  __typename: "Journey";
  id: string;
  title: string;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
}

export interface GetJourneys {
  journeys: GetJourneys_journeys[];
}
