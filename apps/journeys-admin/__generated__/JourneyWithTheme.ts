/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: JourneyWithTheme
// ====================================================

export interface JourneyWithTheme_journeyTheme {
  __typename: "JourneyTheme";
  id: string;
  headerFont: string | null;
  bodyFont: string | null;
  labelFont: string | null;
}

export interface JourneyWithTheme {
  __typename: "Journey";
  journeyTheme: JourneyWithTheme_journeyTheme | null;
}
