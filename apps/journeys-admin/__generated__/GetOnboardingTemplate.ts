/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOnboardingTemplate
// ====================================================

export interface GetOnboardingTemplate_template_primaryImageBlock {
  __typename: "ImageBlock";
  src: string | null;
}

export interface GetOnboardingTemplate_template {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
  primaryImageBlock: GetOnboardingTemplate_template_primaryImageBlock | null;
}

export interface GetOnboardingTemplate {
  template: GetOnboardingTemplate_template | null;
}

export interface GetOnboardingTemplateVariables {
  id: string;
}
