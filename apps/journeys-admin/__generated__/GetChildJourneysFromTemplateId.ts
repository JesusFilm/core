/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneysFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetChildJourneysFromTemplateId
// ====================================================

export interface GetChildJourneysFromTemplateId_journeys_language_name {
  __typename: "LanguageName";
  primary: boolean;
  value: string;
}

export interface GetChildJourneysFromTemplateId_journeys_language {
  __typename: "Language";
  id: string;
  slug: string | null;
  name: GetChildJourneysFromTemplateId_journeys_language_name[];
}

export interface GetChildJourneysFromTemplateId_journeys {
  __typename: "Journey";
  id: string;
  fromTemplateId: string | null;
  language: GetChildJourneysFromTemplateId_journeys_language;
}

export interface GetChildJourneysFromTemplateId {
  journeys: GetChildJourneysFromTemplateId_journeys[];
}

export interface GetChildJourneysFromTemplateIdVariables {
  where?: JourneysFilter | null;
}
