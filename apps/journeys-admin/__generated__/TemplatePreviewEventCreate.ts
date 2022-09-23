/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplatePreviewEventInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplatePreviewEventCreate
// ====================================================

export interface TemplatePreviewEventCreate_templatePreviewEventCreate {
  __typename: "TemplatePreviewEvent";
  id: string;
  userId: string;
  journeyId: string;
}

export interface TemplatePreviewEventCreate {
  templatePreviewEventCreate: TemplatePreviewEventCreate_templatePreviewEventCreate;
}

export interface TemplatePreviewEventCreateVariables {
  input: TemplatePreviewEventInput;
}
