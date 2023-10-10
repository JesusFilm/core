/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus, ThemeName, ThemeMode, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneysAdmin
// ====================================================

export interface GetJourneysAdmin_journeys_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetJourneysAdmin_journeys_language {
  __typename: "Language";
  id: string;
  name: GetJourneysAdmin_journeys_language_name[];
}

export interface GetJourneysAdmin_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetJourneysAdmin_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetJourneysAdmin_journeys_userJourneys_user | null;
}

export interface GetJourneysAdmin_journeys_primaryImageBlock {
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
}

export interface GetJourneysAdmin_journeys {
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
  language: GetJourneysAdmin_journeys_language;
  status: JourneyStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  template: boolean | null;
  userJourneys: GetJourneysAdmin_journeys_userJourneys[] | null;
  primaryImageBlock: GetJourneysAdmin_journeys_primaryImageBlock | null;
}

export interface GetJourneysAdmin {
  /**
   * returns all journeys that match the provided filters
   * If no team id is provided and template is not true then only returns journeys
   * where the user is not a member of a team but is an editor or owner of the
   * journey
   */
  journeys: GetJourneysAdmin_journeys[];
}

export interface GetJourneysAdminVariables {
  status?: JourneyStatus[] | null;
  template?: boolean | null;
  teamId?: string | null;
}
