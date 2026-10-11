/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ThemeMode, CampaignRadius, CampaignButtonRadius } from "./globalTypes";

// ====================================================
// GraphQL fragment: ThemeFields
// ====================================================

export interface ThemeFields {
  __typename: "CampaignTheme";
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
