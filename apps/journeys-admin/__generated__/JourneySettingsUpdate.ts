/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneySettingsUpdate
// ====================================================

export interface JourneySettingsUpdate_journeyUpdate_language {
  __typename: "Language";
  id: string;
}

export interface JourneySettingsUpdate_journeyUpdate_tags {
  __typename: "Tag";
  id: string;
}

export interface JourneySettingsUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  strategySlug: string | null;
  language: JourneySettingsUpdate_journeyUpdate_language;
  tags: JourneySettingsUpdate_journeyUpdate_tags[];
  website: boolean | null;
  showShareButton: boolean | null;
  showLikeButton: boolean | null;
  showDislikeButton: boolean | null;
}

export interface JourneySettingsUpdate {
  journeyUpdate: JourneySettingsUpdate_journeyUpdate;
}

export interface JourneySettingsUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
