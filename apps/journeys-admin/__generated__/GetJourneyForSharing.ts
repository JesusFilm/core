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

export interface GetJourneyForSharing_journey_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
  scale: number | null;
  focalTop: number | null;
  focalLeft: number | null;
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
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  language: GetJourneyForSharing_journey_language;
  themeName: ThemeName;
  themeMode: ThemeMode;
  primaryImageBlock: GetJourneyForSharing_journey_primaryImageBlock | null;
  team: GetJourneyForSharing_journey_team | null;
}

export interface GetJourneyForSharing {
  journey: GetJourneyForSharing_journey;
}

export interface GetJourneyForSharingVariables {
  id: string;
}
