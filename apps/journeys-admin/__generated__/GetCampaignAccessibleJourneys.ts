/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCampaignAccessibleJourneys
// ====================================================

export interface GetCampaignAccessibleJourneys_journeys_team {
  __typename: "Team";
  id: string;
  title: string;
}

export interface GetCampaignAccessibleJourneys_journeys {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  slug: string;
  status: JourneyStatus;
  team: GetCampaignAccessibleJourneys_journeys_team | null;
}

export interface GetCampaignAccessibleJourneys {
  journeys: GetCampaignAccessibleJourneys_journeys[];
}
