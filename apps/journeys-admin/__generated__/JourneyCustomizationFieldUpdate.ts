/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyCustomizationFieldUpdate
// ====================================================

export interface JourneyCustomizationFieldUpdate_journeyCustomizationFieldPublisherUpdate {
  __typename: "JourneyCustomizationField";
  id: string;
  key: string;
  value: string | null;
}

export interface JourneyCustomizationFieldUpdate {
  journeyCustomizationFieldPublisherUpdate: JourneyCustomizationFieldUpdate_journeyCustomizationFieldPublisherUpdate[];
}

export interface JourneyCustomizationFieldUpdateVariables {
  journeyId: string;
  string: string;
}
