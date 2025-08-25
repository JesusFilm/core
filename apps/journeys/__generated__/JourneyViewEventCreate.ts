/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyViewEventCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyViewEventCreate
// ====================================================

export interface JourneyViewEventCreate_journeyViewEventCreate {
  __typename: "JourneyViewEvent";
  id: string | null;
}

export interface JourneyViewEventCreate {
  journeyViewEventCreate: JourneyViewEventCreate_journeyViewEventCreate | null;
}

export interface JourneyViewEventCreateVariables {
  input: JourneyViewEventCreateInput;
}
