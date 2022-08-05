/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplatePublish
// ====================================================

export interface TemplatePublish_journeyPublish {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface TemplatePublish {
  /**
   * Sets journey status to published
   */
  journeyPublish: TemplatePublish_journeyPublish | null;
}

export interface TemplatePublishVariables {
  id: string;
}
