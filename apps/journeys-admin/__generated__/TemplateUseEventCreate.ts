/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateUseEventInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateUseEventCreate
// ====================================================

export interface TemplateUseEventCreate_templateUseEventCreate {
  __typename: "TemplateUseEvent";
  id: string;
  userId: string;
  journeyId: string;
}

export interface TemplateUseEventCreate {
  templateUseEventCreate: TemplateUseEventCreate_templateUseEventCreate;
}

export interface TemplateUseEventCreateVariables {
  input: TemplateUseEventInput;
}
