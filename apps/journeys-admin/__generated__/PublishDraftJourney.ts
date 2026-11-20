/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: PublishDraftJourney
// ====================================================

export interface PublishDraftJourney_journeyPublish {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
  publishedAt: any | null;
}

export interface PublishDraftJourney {
  journeyPublish: PublishDraftJourney_journeyPublish | null;
}

export interface PublishDraftJourneyVariables {
  id: string;
}
