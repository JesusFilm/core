/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneysFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetOnboardingJourneys
// ====================================================

export interface GetOnboardingJourneys_onboardingJourneys_primaryImageBlock {
  __typename: "ImageBlock";
  src: string | null;
}

export interface GetOnboardingJourneys_onboardingJourneys {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  template: boolean | null;
  primaryImageBlock: GetOnboardingJourneys_onboardingJourneys_primaryImageBlock | null;
}

export interface GetOnboardingJourneys {
  onboardingJourneys: GetOnboardingJourneys_onboardingJourneys[];
}

export interface GetOnboardingJourneysVariables {
  where?: JourneysFilter | null;
}
