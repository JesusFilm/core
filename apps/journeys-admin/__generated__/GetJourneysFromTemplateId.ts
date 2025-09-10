/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneysFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneysFromTemplateId
// ====================================================

export interface GetJourneysFromTemplateId_journeys_language_name {
  __typename: "LanguageName";
  primary: boolean;
  value: string;
}

export interface GetJourneysFromTemplateId_journeys_language {
  __typename: "Language";
  id: string;
  slug: string | null;
  name: GetJourneysFromTemplateId_journeys_language_name[];
}

export interface GetJourneysFromTemplateId_journeys {
  __typename: "Journey";
  id: string;
  language: GetJourneysFromTemplateId_journeys_language;
}

export interface GetJourneysFromTemplateId {
  journeys: GetJourneysFromTemplateId_journeys[];
}

export interface GetJourneysFromTemplateIdVariables {
  where?: JourneysFilter | null;
}
