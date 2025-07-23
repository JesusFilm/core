/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyTemplateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateTemplate
// ====================================================

export interface CreateTemplate_journeyTemplate {
  __typename: "Journey";
  id: string;
  template: boolean | null;
}

export interface CreateTemplate {
  journeyTemplate: CreateTemplate_journeyTemplate;
}

export interface CreateTemplateVariables {
  id: string;
  input: JourneyTemplateInput;
}
