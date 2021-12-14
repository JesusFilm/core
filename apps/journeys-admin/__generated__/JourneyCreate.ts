/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyCreateInput, ThemeMode, ThemeName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyCreate
// ====================================================

export interface JourneyCreate_journeyCreate {
  __typename: "Journey";
  id: string;
  title: string;
  locale: string;
  themeMode: ThemeMode;
  themeName: ThemeName;
  description: string | null;
  slug: string;
}

export interface JourneyCreate {
  journeyCreate: JourneyCreate_journeyCreate;
}

export interface JourneyCreateVariables {
  input: JourneyCreateInput;
}
