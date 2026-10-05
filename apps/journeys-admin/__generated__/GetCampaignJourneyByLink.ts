/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IdType, JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCampaignJourneyByLink
// ====================================================

export interface GetCampaignJourneyByLink_journey {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  slug: string;
  status: JourneyStatus;
}

export interface GetCampaignJourneyByLink {
  journey: GetCampaignJourneyByLink_journey;
}

export interface GetCampaignJourneyByLinkVariables {
  id: string;
  idType?: IdType | null;
}
