/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneysFilter, ThemeName, ThemeMode, JourneyStatus, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneys
// ====================================================

export interface GetJourneys_journeys_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetJourneys_journeys_language {
  __typename: "Language";
  id: string;
  name: GetJourneys_journeys_language_name[];
}

export interface GetJourneys_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetJourneys_journeys_userJourneys {
  __typename: "UserJourney";
  id: string | null;
  role: UserJourneyRole | null;
  openedAt: any | null;
  user: GetJourneys_journeys_userJourneys_user | null;
}

export interface GetJourneys_journeys_primaryImageBlock {
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

export interface GetJourneys_journeys_tags_name_language {
  __typename: "Language";
  id: string;
}

export interface GetJourneys_journeys_tags_name {
  __typename: "TagName";
  value: string;
  language: GetJourneys_journeys_tags_name_language;
  primary: boolean;
}

export interface GetJourneys_journeys_tags {
  __typename: "Tag";
  id: string;
  parentId: string | null;
  name: GetJourneys_journeys_tags_name[];
}

export interface GetJourneys_journeys {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  createdAt: any;
  publishedAt: any | null;
  featuredAt: any | null;
  trashedAt: any | null;
  updatedAt: any;
  description: string | null;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  language: GetJourneys_journeys_language;
  status: JourneyStatus;
  /**
   * title for seo and sharing
   */
  seoTitle: string | null;
  seoDescription: string | null;
  template: boolean | null;
  userJourneys: GetJourneys_journeys_userJourneys[] | null;
  primaryImageBlock: GetJourneys_journeys_primaryImageBlock | null;
  tags: GetJourneys_journeys_tags[];
}

export interface GetJourneys {
  journeys: GetJourneys_journeys[];
}

export interface GetJourneysVariables {
  where?: JourneysFilter | null;
}
