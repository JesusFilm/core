/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StrategySlugUpdate
// ====================================================

export interface StrategySlugUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  strategySlug: string | null;
}

export interface StrategySlugUpdate {
  journeyUpdate: StrategySlugUpdate_journeyUpdate;
}

export interface StrategySlugUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
