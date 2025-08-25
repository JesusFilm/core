/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyThemeCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateJourneyFonts
// ====================================================

export interface CreateJourneyFonts_journeyThemeCreate {
  __typename: "JourneyTheme";
  id: string | null;
  journeyId: string | null;
  headerFont: string | null;
  bodyFont: string | null;
  labelFont: string | null;
}

export interface CreateJourneyFonts {
  journeyThemeCreate: CreateJourneyFonts_journeyThemeCreate;
}

export interface CreateJourneyFontsVariables {
  input: JourneyThemeCreateInput;
}
