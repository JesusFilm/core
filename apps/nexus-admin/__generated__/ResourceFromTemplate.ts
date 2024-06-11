/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ResourceFromTemplateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ResourceFromTemplate
// ====================================================

export interface ResourceFromTemplate_resourceFromTemplate {
  __typename: "Resource";
  id: string;
}

export interface ResourceFromTemplate {
  resourceFromTemplate: (ResourceFromTemplate_resourceFromTemplate | null)[] | null;
}

export interface ResourceFromTemplateVariables {
  input: ResourceFromTemplateInput;
}
