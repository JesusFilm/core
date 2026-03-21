/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyCustomizationDescriptionTranslateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyCustomizationDescriptionTranslate
// ====================================================

export interface JourneyCustomizationDescriptionTranslate_journeyCustomizationDescriptionTranslate {
  __typename: "Journey";
  id: string;
  journeyCustomizationDescription: string | null;
}

export interface JourneyCustomizationDescriptionTranslate {
  journeyCustomizationDescriptionTranslate: JourneyCustomizationDescriptionTranslate_journeyCustomizationDescriptionTranslate;
}

export interface JourneyCustomizationDescriptionTranslateVariables {
  input: JourneyCustomizationDescriptionTranslateInput;
}
