/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTrashedPublisherTemplates
// ====================================================

export interface GetTrashedPublisherTemplates_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetTrashedPublisherTemplates_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetTrashedPublisherTemplates_journeys_userJourneys_user | null;
}

export interface GetTrashedPublisherTemplates_journeys_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetTrashedPublisherTemplates_journeys_language {
  __typename: "Language";
  id: string;
  name: GetTrashedPublisherTemplates_journeys_language_name[];
}

export interface GetTrashedPublisherTemplates_journeys_primaryImageBlock {
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

export interface GetTrashedPublisherTemplates_journeys {
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
  trashedAt: any | null;
  userJourneys: GetTrashedPublisherTemplates_journeys_userJourneys[] | null;
  language: GetTrashedPublisherTemplates_journeys_language;
  primaryImageBlock: GetTrashedPublisherTemplates_journeys_primaryImageBlock | null;
}

export interface GetTrashedPublisherTemplates {
  journeys: GetTrashedPublisherTemplates_journeys[];
}
