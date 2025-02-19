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
  id: string;
}

export interface JourneyViewEventCreate {
  /**
   * Creates a JourneyViewEvent, returns null if attempting to create another
   * JourneyViewEvent with the same userId, journeyId, and within the same 24hr
   * period of the previous JourneyViewEvent
   */
  journeyViewEventCreate: JourneyViewEventCreate_journeyViewEventCreate | null;
}

export interface JourneyViewEventCreateVariables {
  input: JourneyViewEventCreateInput;
}
