/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeName, ThemeMode, JourneyStatus, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetActivePublisherTemplates
// ====================================================

export interface GetActivePublisherTemplates_journeys_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface GetActivePublisherTemplates_journeys_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  /**
   * Date time of when the journey was first opened
   */
  openedAt: any | null;
  user: GetActivePublisherTemplates_journeys_userJourneys_user | null;
}

export interface GetActivePublisherTemplates_journeys_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetActivePublisherTemplates_journeys_language {
  __typename: "Language";
  id: string;
  name: GetActivePublisherTemplates_journeys_language_name[];
}

export interface GetActivePublisherTemplates_journeys_primaryImageBlock {
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

export interface GetActivePublisherTemplates_journeys {
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
  userJourneys: GetActivePublisherTemplates_journeys_userJourneys[] | null;
  language: GetActivePublisherTemplates_journeys_language;
  primaryImageBlock: GetActivePublisherTemplates_journeys_primaryImageBlock | null;
}

export interface GetActivePublisherTemplates {
  journeys: GetActivePublisherTemplates_journeys[];
}
