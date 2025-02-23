import * as Types from '../../../../__generated__/types';

export type GetJourneyAnalyticsQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  period?: Types.InputMaybe<Types.Scalars['String']['input']>;
  date?: Types.InputMaybe<Types.Scalars['String']['input']>;
  interval?: Types.InputMaybe<Types.Scalars['String']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetJourneyAnalyticsQuery = { __typename?: 'Query', journeySteps: Array<{ __typename?: 'PlausibleStatsResponse', property: string, visitors?: number | null, timeOnPage?: number | null }>, journeyStepsActions: Array<{ __typename?: 'PlausibleStatsResponse', property: string, visitors?: number | null }>, journeyReferrer: Array<{ __typename?: 'PlausibleStatsResponse', property: string, visitors?: number | null }>, journeyUtmCampaign: Array<{ __typename?: 'PlausibleStatsResponse', property: string, visitors?: number | null }>, journeyVisitorsPageExits: Array<{ __typename?: 'PlausibleStatsResponse', property: string, visitors?: number | null }>, journeyActionsSums: Array<{ __typename?: 'PlausibleStatsResponse', property: string, visitors?: number | null }>, journeyAggregateVisitors: { __typename?: 'PlausibleStatsAggregateResponse', visitors?: { __typename?: 'PlausibleStatsAggregateValue', value: number } | null } };
