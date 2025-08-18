/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyThemeUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateJourneyFonts
// ====================================================

export interface UpdateJourneyFonts_journeyThemeUpdate {
  __typename: "JourneyTheme";
  id: string;
  journeyId: string;
  headerFont: string | null;
  bodyFont: string | null;
  labelFont: string | null;
}

export interface UpdateJourneyFonts {
  journeyThemeUpdate: UpdateJourneyFonts_journeyThemeUpdate;
}

export interface UpdateJourneyFontsVariables {
  id: string;
  input: JourneyThemeUpdateInput;
}
