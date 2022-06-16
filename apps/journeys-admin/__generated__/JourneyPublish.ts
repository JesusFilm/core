/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyPublish
// ====================================================

export interface JourneyPublish_journeyPublish {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface JourneyPublish {
  journeyPublish: JourneyPublish_journeyPublish | null;
}

export interface JourneyPublishVariables {
  id: string;
}
