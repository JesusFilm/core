/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyMenuButtonIcon, ButtonVariant, ButtonColor, ButtonSize, ContactActionType, ButtonAlignment, BlockEventLabel, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL fragment: JourneySettingsFields
// ====================================================

export interface JourneySettingsFields_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface JourneySettingsFields_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: JourneySettingsFields_language_name[];
}

export interface JourneySettingsFields_tags {
  __typename: "Tag";
  id: string;
}

export interface JourneySettingsFields_menuStepBlock {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface JourneySettingsFields {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  strategySlug: string | null;
  language: JourneySettingsFields_language;
  tags: JourneySettingsFields_tags[];
  website: boolean | null;
  showShareButton: boolean | null;
  showLikeButton: boolean | null;
  showDislikeButton: boolean | null;
  /**
   * public title for viewers
   */
  displayTitle: string | null;
  menuButtonIcon: JourneyMenuButtonIcon | null;
  menuStepBlock: JourneySettingsFields_menuStepBlock | null;
  socialNodeX: number | null;
  socialNodeY: number | null;
}
