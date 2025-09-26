/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneysFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetParentJourneysFromTemplateId
// ====================================================

export interface GetParentJourneysFromTemplateId_journeys_language_name {
  __typename: "LanguageName";
  primary: boolean;
  value: string;
}

export interface GetParentJourneysFromTemplateId_journeys_language {
  __typename: "Language";
  id: string;
  slug: string | null;
  name: GetParentJourneysFromTemplateId_journeys_language_name[];
}

export interface GetParentJourneysFromTemplateId_journeys {
  __typename: "Journey";
  id: string;
  fromTemplateId: string | null;
  language: GetParentJourneysFromTemplateId_journeys_language;
}

export interface GetParentJourneysFromTemplateId {
  journeys: GetParentJourneysFromTemplateId_journeys[];
}

export interface GetParentJourneysFromTemplateIdVariables {
  where?: JourneysFilter | null;
}
