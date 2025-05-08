/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyForSharing
// ====================================================

export interface GetJourneyForSharing_journey_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetJourneyForSharing_journey_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: GetJourneyForSharing_journey_language_name[];
}

export interface GetJourneyForSharing_journey_team_customDomains {
  __typename: "CustomDomain";
  name: string;
}

export interface GetJourneyForSharing_journey_team {
  __typename: "Team";
  id: string;
  customDomains: GetJourneyForSharing_journey_team_customDomains[];
}

export interface GetJourneyForSharing_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: GetJourneyForSharing_journey_language;
  themeName: ThemeName;
  themeMode: ThemeMode;
  team: GetJourneyForSharing_journey_team | null;
}

export interface GetJourneyForSharing {
  journey: GetJourneyForSharing_journey;
}

export interface GetJourneyForSharingVariables {
  id: string;
}
