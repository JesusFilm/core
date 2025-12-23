/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IdType, PlausibleStatsAggregateFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTemplateFamilyStatsAggregate
// ====================================================

export interface GetTemplateFamilyStatsAggregate_templateFamilyStatsAggregate {
  __typename: "TemplateFamilyStatsAggregateResponse";
  childJourneysCount: number;
  totalJourneysViews: number;
  totalJourneysResponses: number;
}

export interface GetTemplateFamilyStatsAggregate {
  templateFamilyStatsAggregate: GetTemplateFamilyStatsAggregate_templateFamilyStatsAggregate | null;
}

export interface GetTemplateFamilyStatsAggregateVariables {
  id: string;
  idType?: IdType | null;
  where: PlausibleStatsAggregateFilter;
}
