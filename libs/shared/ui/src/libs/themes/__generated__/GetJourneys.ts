/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetJourneys
// ====================================================

export interface GetJourneys_journeys {
  __typename: "Journey";
  themeName: ThemeName;
  themeMode: ThemeMode;
}

export interface GetJourneys {
  journeys: GetJourneys_journeys[];
}
