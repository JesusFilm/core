/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyCustomizationFieldInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyCustomizationFieldUpdate
// ====================================================

export interface JourneyCustomizationFieldUpdate_journeyCustomizationFieldUserUpdate {
  __typename: "JourneyCustomizationField";
  id: string;
  key: string;
  value: string | null;
}

export interface JourneyCustomizationFieldUpdate {
  journeyCustomizationFieldUserUpdate: JourneyCustomizationFieldUpdate_journeyCustomizationFieldUserUpdate[];
}

export interface JourneyCustomizationFieldUpdateVariables {
  journeyId: string;
  input: JourneyCustomizationFieldInput[];
}
