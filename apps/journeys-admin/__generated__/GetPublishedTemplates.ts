/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPublishedTemplates
// ====================================================

export interface GetPublishedTemplates_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetPublishedTemplates_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetPublishedTemplates_journeys_userJourneys_user | null;
}

export interface GetPublishedTemplates_journeys_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetPublishedTemplates_journeys_language {
  __typename: "Language";
  id: string;
  name: GetPublishedTemplates_journeys_language_name[];
}

export interface GetPublishedTemplates_journeys_primaryImageBlock {
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

export interface GetPublishedTemplates_journeys {
  __typename: "Journey";
  id: string;
  title: string;
  createdAt: any;
  publishedAt: any | null;
  description: string | null;
  slug: string;
  themeName: ThemeName;
  themeMode: ThemeMode;
  status: JourneyStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  template: boolean | null;
  userJourneys: GetPublishedTemplates_journeys_userJourneys[] | null;
  language: GetPublishedTemplates_journeys_language;
  primaryImageBlock: GetPublishedTemplates_journeys_primaryImageBlock | null;
}

export interface GetPublishedTemplates {
  journeys: GetPublishedTemplates_journeys[];
}
