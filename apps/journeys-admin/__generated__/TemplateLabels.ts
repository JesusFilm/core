/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TemplateLabels
// ====================================================

export interface TemplateLabels_adminJourney {
  __typename: "Journey";
  id: string;
  /**
   * Own template display label for custom1. Requires Journey Read permission or a successful Journey update response; never inherited from fromTemplateId.
   */
  custom1Label: string | null;
  /**
   * Own template display label for custom2. Requires Journey Read permission or a successful Journey update response; never inherited from fromTemplateId.
   */
  custom2Label: string | null;
  /**
   * Own template display label for custom3. Requires Journey Read permission or a successful Journey update response; never inherited from fromTemplateId.
   */
  custom3Label: string | null;
}

export interface TemplateLabels {
  adminJourney: TemplateLabels_adminJourney;
}

export interface TemplateLabelsVariables {
  id: string;
}
