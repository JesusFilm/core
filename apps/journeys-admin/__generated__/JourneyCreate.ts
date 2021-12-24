/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyCreate
// ====================================================

export interface JourneyCreate_journeyCreate {
  __typename: "Journey";
  id: string;
  title: string;
  slug: string;
}

export interface JourneyCreate {
  journeyCreate: JourneyCreate_journeyCreate;
}

export interface JourneyCreateVariables {
  input: JourneyCreateInput;
}
