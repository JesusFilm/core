/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from '../../../../__generated__/globalTypes';

// ====================================================
// GraphQL mutation operation: JourneyDuplicate
// ====================================================

export interface JourneyDuplicate_journeyDuplicate {
  __typename: "Journey";
  id: string;
  template: boolean | null;
}

export interface JourneyDuplicate {
  journeyDuplicate: JourneyDuplicate_journeyDuplicate;
}

export interface JourneyDuplicateVariables {
  id: string;
  teamId: string;
  forceNonTemplate?: boolean | null;
  status?: JourneyStatus | null;
}
