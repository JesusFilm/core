/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyCustomizationDescriptionUpdate
// ====================================================

export interface JourneyCustomizationDescriptionUpdate_journeyCustomizationFieldPublisherUpdate {
  __typename: "JourneyCustomizationField";
  id: string;
  key: string;
  value: string | null;
}

export interface JourneyCustomizationDescriptionUpdate {
  journeyCustomizationFieldPublisherUpdate: JourneyCustomizationDescriptionUpdate_journeyCustomizationFieldPublisherUpdate[];
}

export interface JourneyCustomizationDescriptionUpdateVariables {
  journeyId: string;
  string: string;
}
