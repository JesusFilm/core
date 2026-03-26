/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyCustomizationDescriptionTranslate
// ====================================================

export interface JourneyCustomizationDescriptionTranslate_journeyCustomizationDescriptionTranslate {
  __typename: "Journey";
  id: string;
}

export interface JourneyCustomizationDescriptionTranslate {
  journeyCustomizationDescriptionTranslate: JourneyCustomizationDescriptionTranslate_journeyCustomizationDescriptionTranslate;
}

export interface JourneyCustomizationDescriptionTranslateVariables {
  input: JourneyCustomizationDescriptionTranslateInput;
}

export interface JourneyCustomizationDescriptionTranslateInput {
  journeyId: string;
  sourceLanguageName: string;
  targetLanguageName: string;
}
