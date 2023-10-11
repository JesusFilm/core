/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneySettingsUpdate
// ====================================================

export interface JourneySettingsUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
  strategySlug: string | null;
}

export interface JourneySettingsUpdate {
  journeyUpdate: JourneySettingsUpdate_journeyUpdate;
}

export interface JourneySettingsUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
