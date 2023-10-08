/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateSettingsUpdate
// ====================================================

export interface TemplateSettingsUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
  strategySlug: string | null;
}

export interface TemplateSettingsUpdate {
  journeyUpdate: TemplateSettingsUpdate_journeyUpdate;
}

export interface TemplateSettingsUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
