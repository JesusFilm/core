/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneySettingsUpdate
// ====================================================

export interface JourneySettingsUpdate_journeyUpdate_tags {
  __typename: "Tag";
  id: string;
}

export interface JourneySettingsUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
  strategySlug: string | null;
  tags: JourneySettingsUpdate_journeyUpdate_tags[];
}

export interface JourneySettingsUpdate {
  journeyUpdate: JourneySettingsUpdate_journeyUpdate;
}

export interface JourneySettingsUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
