/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus, ThemeName, ThemeMode, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetAdminJourneys
// ====================================================

export interface GetAdminJourneys_journeys_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetAdminJourneys_journeys_language {
  __typename: "Language";
  id: string;
  name: GetAdminJourneys_journeys_language_name[];
}

export interface GetAdminJourneys_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetAdminJourneys_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetAdminJourneys_journeys_userJourneys_user | null;
}

export interface GetAdminJourneys_journeys_primaryImageBlock {
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

export interface GetAdminJourneys_journeys {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  createdAt: any;
  publishedAt: any | null;
  trashedAt: any | null;
  updatedAt: any;
  description: string | null;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  language: GetAdminJourneys_journeys_language;
  status: JourneyStatus;
  /**
   * title for seo and sharing
   */
  seoTitle: string | null;
  seoDescription: string | null;
  template: boolean | null;
  userJourneys: GetAdminJourneys_journeys_userJourneys[] | null;
  primaryImageBlock: GetAdminJourneys_journeys_primaryImageBlock | null;
  fromTemplateId: string | null;
}

export interface GetAdminJourneys {
  /**
   * returns all journeys that match the provided filters
   * If no team id is provided and template is not true then only returns journeys
   * where the user is not a member of a team but is an editor or owner of the
   * journey
   */
  journeys: GetAdminJourneys_journeys[];
}

export interface GetAdminJourneysVariables {
  status?: JourneyStatus[] | null;
  template?: boolean | null;
  useLastActiveTeamId?: boolean | null;
}
