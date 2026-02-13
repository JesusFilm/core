/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IdType, PlausibleStatsBreakdownFilter, PlausibleEvent, JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTemplateFamilyStatsBreakdown
// ====================================================

export interface GetTemplateFamilyStatsBreakdown_templateFamilyStatsBreakdown_stats {
  __typename: "TemplateFamilyStatsEventResponse";
  event: string;
  visitors: number;
}

export interface GetTemplateFamilyStatsBreakdown_templateFamilyStatsBreakdown {
  __typename: "TemplateFamilyStatsBreakdownResponse";
  journeyId: string;
  journeyName: string;
  teamName: string;
  status: JourneyStatus | null;
  stats: GetTemplateFamilyStatsBreakdown_templateFamilyStatsBreakdown_stats[];
}

export interface GetTemplateFamilyStatsBreakdown {
  templateFamilyStatsBreakdown: GetTemplateFamilyStatsBreakdown_templateFamilyStatsBreakdown[] | null;
}

export interface GetTemplateFamilyStatsBreakdownVariables {
  id: string;
  idType?: IdType | null;
  where: PlausibleStatsBreakdownFilter;
  events?: PlausibleEvent[] | null;
  status?: JourneyStatus[] | null;
}
