/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignThemeUpdateInput, ThemeMode, CampaignRadius, CampaignButtonRadius } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignThemeUpdate
// ====================================================

export interface CampaignThemeUpdate_campaignThemeUpdate {
  __typename: "CampaignTheme";
  id: string;
  themeMode: ThemeMode;
  /**
   * Google Fonts family; null = the base theme default.
   */
  headerFont: string | null;
  bodyFont: string | null;
  labelFont: string | null;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  contrastBackgroundColor: string;
  contrastTextColor: string;
  radius: CampaignRadius;
  buttonRadius: CampaignButtonRadius;
}

export interface CampaignThemeUpdate {
  /**
   * Update the Campaign Theme: its mode, any of the three fonts, any of the eight colours, the corner radius or the button shape. Only the given columns change. Applying a Theme Preset is this mutation with the mode and the eight colours; fonts and both radii stay. Nothing records which preset is active. Each call is one Command in the editor; undo writes the previous values back through the same mutation.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a Campaign Theme.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: the colour column): a colour is null, empty or not a hex colour.
   * - BAD_USER_INPUT (field: `headerFont` / `bodyFont` / `labelFont`): a font name is not in the shared curated list.
   * - BAD_USER_INPUT (field: `themeMode` / `radius` / `buttonRadius`): null, or not one of the enum’s values.
   */
  campaignThemeUpdate: CampaignThemeUpdate_campaignThemeUpdate;
}

export interface CampaignThemeUpdateVariables {
  id: string;
  input: CampaignThemeUpdateInput;
}
